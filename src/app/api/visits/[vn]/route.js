import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { vn } = resolvedParams;

    if (!vn) {
      return NextResponse.json({ error: 'VN is required' }, { status: 400 });
    }

    // 1. Fetch admission (Admit) details if any (ipt)
    let admission = null;
    try {
      const admissionSql = `
        SELECT i.an, i.regdate, i.regtime, i.dchdate, i.dchtime, i.ward, w.name AS ward_name,
               d.name AS doctor_name, i.prediag
        FROM ipt i
        LEFT OUTER JOIN ward w ON w.ward = i.ward
        LEFT OUTER JOIN doctor d ON d.code = i.admdoctor
        WHERE i.vn = ?
        LIMIT 1
      `;
      const admissions = await query(admissionSql, [vn]);
      admission = admissions.length > 0 ? admissions[0] : null;
    } catch (err) {
      console.warn('Failed to query ipt table with admdoctor join:', err.message);
      try {
        // Fallback 1: Try with ward name but without doctor join in case doctor join fails
        const admissionSql = `
          SELECT i.an, i.regdate, i.regtime, i.dchdate, i.dchtime, i.ward, w.name AS ward_name,
                 i.prediag
          FROM ipt i
          LEFT OUTER JOIN ward w ON w.ward = i.ward
          WHERE i.vn = ?
          LIMIT 1
        `;
        const admissions = await query(admissionSql, [vn]);
        admission = admissions.length > 0 ? admissions[0] : null;
      } catch (err2) {
        console.warn('Failed to query ipt table with ward join:', err2.message);
        try {
          // Fallback 2: Plain query from ipt only
          const admissions = await query('SELECT an, regdate, regtime, dchdate, dchtime, ward, prediag FROM ipt WHERE vn = ? LIMIT 1', [vn]);
          admission = admissions.length > 0 ? admissions[0] : null;
        } catch (e) {
          admission = null;
        }
      }
    }

    const hasAdmit = admission && admission.an;
    const targetAn = hasAdmit ? admission.an : null;

    // 2. Fetch vitals/screening from opdscreen (always uses VN)
    const screeningSql = `
      SELECT vn, vstdate, vsttime, bps, bpd, bw, height, bmi, waist, pulse, temperature, rr, cc, pe, hpi
      FROM opdscreen
      WHERE vn = ?
      LIMIT 1
    `;
    const screenings = await query(screeningSql, [vn]);
    const screening = screenings.length > 0 ? screenings[0] : null;

    // 2.5 Fetch treatment rights (pttype)
    let pttype = null;
    try {
      const pttypeSql = `
        SELECT o.pttype, p.name AS pttype_name
        FROM ovst o
        LEFT OUTER JOIN pttype p ON p.pttype = o.pttype
        WHERE o.vn = ?
        LIMIT 1
      `;
      const pttypes = await query(pttypeSql, [vn]);
      pttype = pttypes.length > 0 ? pttypes[0] : null;
    } catch (err) {
      console.warn('Failed to query pttype table:', err.message);
      try {
        const pttypes = await query('SELECT pttype FROM ovst WHERE vn = ? LIMIT 1', [vn]);
        pttype = pttypes.length > 0 ? pttypes[0] : null;
      } catch (e) {
        pttype = null;
      }
    }

    // 3. Fetch drugs prescribed on this visit (uses AN if admitted, otherwise VN)
    const drugsSql = `
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
      WHERE ${hasAdmit ? 'i.an = ?' : 'i.vn = ? AND i.income IN (\'03\',\'05\',\'17\')'}
      ORDER BY i.item_no ASC
    `;
    const drugs = await query(drugsSql, [hasAdmit ? targetAn : vn]);

    // 4. Fetch labs reported on this visit (uses AN in vn column if admitted, otherwise VN)
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
      LEFT OUTER JOIN lab_items_sub_group lisg on  lisg.lab_items_sub_group_code = lisgl.lab_items_sub_group_code
      WHERE lh.vn = ? AND lo.lab_order_result <> ''
      ORDER BY lisg.lab_items_sub_group_name ASC
    `;
    const labs = await query(labsSql, [hasAdmit ? targetAn : vn]);

    // 5. Fetch xrays reported on this visit (uses AN if admitted, otherwise VN)
    const xraysSql = `
      SELECT x.xn, x.hn, x.report_date, x.vn, x.an, x.request_doctor, d.name AS request_doctor_name, x.request_date, x.request_time,
             x.confirm, x.request_depcode, i.xray_items_name, xt.name as type_name, x.report_text,
             x.confirm_read_film, IF(x.report_text <> ' ', 1, 0) as report_st
      FROM xray_report x
      LEFT OUTER JOIN xray_items i on i.xray_items_code = x.xray_items_code
      LEFT OUTER JOIN xray_head xh on xh.vn = x.vn
      LEFT OUTER JOIN xray_type xt on xt.xray_type = x.xray_type
      LEFT OUTER JOIN doctor d on d.code = x.request_doctor 
        OR (LENGTH(x.request_doctor) < 3 AND d.code = LPAD(x.request_doctor, 3, '0'))
      WHERE ${hasAdmit ? 'x.an = ?' : 'x.vn = ?'}
      ORDER BY x.request_date DESC
    `;
    const xrays = await query(xraysSql, [hasAdmit ? targetAn : vn]);
 
    // 6. Fetch appointments on this visit (oapp)
    let appointments = [];
    try {
      const appointmentsSql = `
        SELECT o.nextdate, o.nexttime, o.note, o.contact_point,
               c.name AS clinic_name, d.name AS doctor_name
        FROM oapp o
        LEFT OUTER JOIN clinic c ON c.clinic = o.clinic
        LEFT OUTER JOIN doctor d ON d.code = o.doctor
        WHERE o.vn = ?
        ORDER BY o.nextdate ASC
      `;
      appointments = await query(appointmentsSql, [vn]);
    } catch (err) {
      console.warn('Failed to query oapp table:', err.message);
      try {
        appointments = await query('SELECT nextdate, nexttime, note FROM oapp WHERE vn = ?', [vn]);
      } catch (e) {
        appointments = [];
      }
    }

    // 7. Fetch referrals on this visit (referout)
    let referrals = [];
    try {
      const referralsSql = `
        SELECT r.refer_date, r.refer_time, r.refer_hospcode, r.refer_cause,
               c.name AS refer_cause_name, r.pre_diagnosis, r.diagnosis_text,
               h.name AS hosp_name, d.name AS doctor_name,
               k.department AS origin_dep_name, r.depcode, r.refer_point
        FROM referout r
        LEFT OUTER JOIN hospcode h ON h.hospcode = r.refer_hospcode
        LEFT OUTER JOIN doctor d ON d.code = r.doctor
        LEFT OUTER JOIN kskdepartment k ON k.depcode = r.depcode
        LEFT OUTER JOIN refer_cause c ON c.id = r.refer_cause
        WHERE r.vn = ?
        ORDER BY r.refer_date DESC
      `;
      referrals = await query(referralsSql, [vn]);
    } catch (err) {
      console.warn('Failed to query referout table with full joins:', err.message);
      try {
        const referralsSql = `
          SELECT r.refer_date, r.refer_time, r.refer_hospcode, r.refer_cause,
                 c.name AS refer_cause_name, r.pre_diagnosis, r.diagnosis_text,
                 h.name AS hosp_name, d.name AS doctor_name, r.depcode, r.refer_point
          FROM referout r
          LEFT OUTER JOIN hospcode h ON h.hospcode = r.refer_hospcode
          LEFT OUTER JOIN doctor d ON d.code = r.doctor
          LEFT OUTER JOIN refer_cause c ON c.id = r.refer_cause
          WHERE r.vn = ?
          ORDER BY r.refer_date DESC
        `;
        referrals = await query(referralsSql, [vn]);
      } catch (err2) {
        console.warn('Failed to query referout table with refer_cause join:', err2.message);
        try {
          const referralsSql = `
            SELECT r.refer_date, r.refer_time, r.refer_hospcode, r.refer_cause,
                   r.pre_diagnosis, r.diagnosis_text,
                   h.name AS hosp_name, d.name AS doctor_name, r.depcode, r.refer_point
            FROM referout r
            LEFT OUTER JOIN hospcode h ON h.hospcode = r.refer_hospcode
            LEFT OUTER JOIN doctor d ON d.code = r.doctor
            WHERE r.vn = ?
            ORDER BY r.refer_date DESC
          `;
          referrals = await query(referralsSql, [vn]);
        } catch (err3) {
          console.warn('Failed to query referout table with hospcode/doctor joins:', err3.message);
          try {
            referrals = await query('SELECT refer_date, refer_time, refer_hospcode, refer_cause, pre_diagnosis, diagnosis_text, depcode, refer_point FROM referout WHERE vn = ? ORDER BY refer_date DESC', [vn]);
          } catch (e) {
            referrals = [];
          }
        }
      }
    }

    // 8. Fetch referrals coming in (referin)
    let referins = [];
    try {
      const referinsSql = `
        SELECT r.refer_date, r.refer_time, r.refer_hospcode, r.rfrcs AS refer_cause,
               c.name AS refer_cause_name, r.pre_diagnosis,
               h.name AS hosp_name, r.refer_doctor_name AS doctor_name, r.refer_point, r.referin_number AS referin_no
        FROM referin r
        LEFT OUTER JOIN hospcode h ON h.hospcode = r.refer_hospcode
        LEFT OUTER JOIN refer_cause c ON c.id = r.rfrcs
        WHERE r.vn = ?
        ORDER BY r.refer_date DESC
      `;
      referins = await query(referinsSql, [vn]);
    } catch (err) {
      console.warn('Failed to query referin table with full joins:', err.message);
      try {
        const referinsSql = `
          SELECT r.refer_date, r.refer_time, r.refer_hospcode, r.rfrcs AS refer_cause,
                 r.pre_diagnosis, h.name AS hosp_name, r.refer_point, r.referin_number AS referin_no
          FROM referin r
          LEFT OUTER JOIN hospcode h ON h.hospcode = r.refer_hospcode
          WHERE r.vn = ?
          ORDER BY r.refer_date DESC
        `;
        referins = await query(referinsSql, [vn]);
      } catch (err2) {
        console.warn('Failed to query referin table with hospcode join:', err2.message);
        try {
          referins = await query('SELECT refer_date, refer_hospcode, rfrcs AS refer_cause, pre_diagnosis, refer_point, referin_number AS referin_no FROM referin WHERE vn = ? ORDER BY refer_date DESC', [vn]);
        } catch (e) {
          referins = [];
        }
      }
    }

    // 9. Fetch diagnoses (uses AN & iptdiag if admitted, otherwise VN & ovstdiag)
    let diagnoses = [];
    try {
      const diagnosesSql = hasAdmit ? `
        SELECT od.icd10, od.diagtype, dt.name AS diagtype_name, 
               i.name AS icd10_name, i.tname AS icd10_tname,
               d.name AS doctor_name
        FROM iptdiag od
        LEFT OUTER JOIN icd101 i ON i.code = od.icd10
        LEFT OUTER JOIN diagtype dt ON dt.diagtype = od.diagtype
        LEFT OUTER JOIN doctor d ON d.code = od.doctor
        WHERE od.an = ?
        ORDER BY od.diagtype ASC, od.ipt_diag_id ASC
      ` : `
        SELECT od.icd10, od.diagtype, dt.name AS diagtype_name, 
               i.name AS icd10_name, i.tname AS icd10_tname,
               d.name AS doctor_name
        FROM ovstdiag od
        LEFT OUTER JOIN icd101 i ON i.code = od.icd10
        LEFT OUTER JOIN diagtype dt ON dt.diagtype = od.diagtype
        LEFT OUTER JOIN doctor d ON d.code = od.doctor
        WHERE od.vn = ?
        ORDER BY od.diagtype ASC, od.ovst_diag_id ASC
      `;
      diagnoses = await query(diagnosesSql, [hasAdmit ? targetAn : vn]);
    } catch (err) {
      console.warn('Failed to query diagnoses:', err.message);
      diagnoses = [];
    }

    // 9.5. Fetch procedures (uses AN & iptoprt if admitted, otherwise VN & doctor_operation)
    let procedures = [];
    try {
      const proceduresSql = hasAdmit ? `
        SELECT op.icd9, i.name AS icd9_name, CONCAT(op.opdate, ' ', op.optime) AS begin_date_time, d.name AS doctor_name
        FROM iptoprt op
        LEFT OUTER JOIN icd9cm1 i ON i.code = op.icd9
        LEFT OUTER JOIN doctor d ON d.code = op.doctor
        WHERE op.an = ?
      ` : `
        SELECT op.icd9, i.name AS icd9_name, op.begin_date_time, d.name AS doctor_name
        FROM doctor_operation op
        LEFT OUTER JOIN icd9cm1 i ON i.code = op.icd9
        LEFT OUTER JOIN doctor d ON d.code = op.doctor
        WHERE op.vn = ?
      `;
      procedures = await query(proceduresSql, [hasAdmit ? targetAn : vn]);
    } catch (err) {
      console.warn('Failed to query procedures:', err.message);
      procedures = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        screening,
        pttype,
        drugs,
        labs,
        xrays,
        appointments,
        referrals,
        referins,
        admission,
        diagnoses,
        procedures
      }
    });
  } catch (error) {
    console.error('Visit Details API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
