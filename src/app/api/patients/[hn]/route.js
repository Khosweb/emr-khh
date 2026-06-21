import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { hn } = resolvedParams;

    if (!hn) {
      return NextResponse.json({ error: 'HN is required' }, { status: 400 });
    }

    // 1. Fetch patient basic info
    const patientSql = `
      SELECT hn, pname, fname, lname, cid, sex, birthday, 
             TIMESTAMPDIFF(YEAR, birthday, CURDATE()) AS age 
      FROM patient 
      WHERE hn = ? 
      LIMIT 1
    `;
    const patients = await query(patientSql, [hn]);

    if (patients.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patient = patients[0];

    // 2. Fetch visit history
    const visitsSql = `
      SELECT o.vn, o.an, o.vstdate, o.vsttime, 
             IF(d.department LIKE '%ARV%', 'Item Lock', d.department) AS department
      FROM ovst o
      LEFT OUTER JOIN kskdepartment d ON d.depcode = o.main_dep
      WHERE o.hn = ?
      ORDER BY o.vstdate DESC, o.vsttime DESC
      LIMIT 50
    `;
    const visits = await query(visitsSql, [hn]);

    // 3. Fetch drug allergy history
    const allergiesSql = `
      SELECT report_date, agent, symptom 
      FROM opd_allergy 
      WHERE hn = ?
      ORDER BY report_date DESC
    `;
    const allergies = await query(allergiesSql, [hn]);

    // 3.5 Fetch chronic diseases (โรคประจำตัว)
    let chronics = [];
    try {
      const chronicsSql = `
        SELECT c.name AS clinic_name
        FROM clinicmember cm
        LEFT OUTER JOIN clinic c ON c.clinic = cm.clinic
        WHERE cm.hn = ? AND (cm.dchdate IS NULL OR cm.discharge <> 'Y')
      `;
      chronics = await query(chronicsSql, [hn]);
    } catch (err) {
      console.warn('Failed to query chronic diseases:', err.message);
      chronics = [];
    }

    // 4. Fetch drug prescriptions (Limit to last 50 entries)
    const prescriptionsSql = `
      SELECT i.order_no, i.rxdate, i.item_no, i.qty,
             CONCAT(s.name, ' ', s.strength, ' ', s.units) AS drug_name, 
             i.icode,
             IF(i.sp_use > 1, 
                CONCAT(u.name1, ' ', u.name2, ' ', u.name3), 
                CONCAT(u1.name1, u1.name2, u1.name3)
             ) AS drug_usage
      FROM opitemrece i
      LEFT OUTER JOIN s_drugitems s ON s.icode = i.icode
      LEFT OUTER JOIN drugitems d ON d.icode = i.icode
      LEFT OUTER JOIN drugusage u1 ON u1.drugusage = i.drugusage
      LEFT OUTER JOIN drugusage u2 ON u2.drugusage = d.drugusage
      LEFT OUTER JOIN sp_use u ON u.sp_use = i.sp_use
      WHERE i.hn = ? AND i.income IN ('03','05','17')
      ORDER BY i.rxdate DESC, i.item_no ASC
      LIMIT 50
    `;
    const prescriptions = await query(prescriptionsSql, [hn]);

    // 5. Fetch Lab results history
    const labsSql = `
      SELECT lo.lab_order_number, lisg.lab_items_sub_group_name as sub_group, lh.order_date,
             CONCAT(li.lab_items_name, ' : ', lg.lab_items_group_name) as lab_name,
             lo.lab_order_result as result, lo.lab_items_normal_value_ref as normal_value, 
             lo.confirm, li.lab_items_unit as unit
      FROM lab_order lo
      LEFT OUTER JOIN lab_head lh on lh.lab_order_number = lo.lab_order_number
      LEFT OUTER JOIN lab_items li on li.lab_items_code = lo.lab_items_code
      LEFT OUTER JOIN lab_items_group lg on lg.lab_items_group_code = li.lab_items_group
      LEFT OUTER JOIN lab_items_sub_group_list lisgl on lisgl.lab_items_code = li.lab_items_code
      LEFT OUTER JOIN lab_items_sub_group lisg on lisg.lab_items_sub_group_code = lisgl.lab_items_sub_group_code
      WHERE lh.hn = ? AND lo.lab_order_result <> ''
      ORDER BY lh.order_date DESC, lisg.lab_items_sub_group_name ASC
      LIMIT 50
    `;
    const labs = await query(labsSql, [hn]);

    // 6. Fetch Xray reports history
    const xraysSql = `
      SELECT x.xn, x.hn, x.report_date, x.vn, x.an, x.request_doctor, x.request_date, x.request_time,
             x.confirm, x.request_depcode, i.xray_items_name, xt.name as type_name, x.report_text,
             x.confirm_read_film, IF(x.report_text <> ' ', 1, 0) as report_st
      FROM xray_report x
      LEFT OUTER JOIN xray_items i on i.xray_items_code = x.xray_items_code
      LEFT OUTER JOIN xray_head xh on xh.vn = x.vn
      LEFT OUTER JOIN xray_type xt on xt.xray_type = x.xray_type
      WHERE x.hn = ?
      ORDER BY x.request_date DESC
      LIMIT 30
    `;
    const xrays = await query(xraysSql, [hn]);

    return NextResponse.json({
      success: true,
      data: {
        patient,
        visits,
        allergies,
        chronics,
        prescriptions,
        labs,
        xrays
      }
    });
  } catch (error) {
    console.error('Patient Full Details API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
