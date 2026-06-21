import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { hn } = resolvedParams;

    if (!hn) {
      return NextResponse.json({ error: 'HN is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch paginated visits using bound parameters for limit and offset
    const visitsSql = `
      SELECT o.vn, o.an, o.vstdate, o.vsttime, 
             IF(d.department LIKE '%ARV%', 'Item Lock', d.department) AS department
      FROM ovst o
      LEFT OUTER JOIN kskdepartment d ON d.depcode = o.main_dep
      WHERE o.hn = ?
      ORDER BY o.vstdate DESC, o.vsttime DESC
      LIMIT ? OFFSET ?
    `;
    const visits = await query(visitsSql, [hn, limit, offset]);

    return NextResponse.json({
      success: true,
      visits
    });
  } catch (error) {
    console.error('Paginated Visits API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
