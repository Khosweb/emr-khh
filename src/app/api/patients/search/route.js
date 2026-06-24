import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get('cid');

  if (!cid) {
    return NextResponse.json({ error: 'CID is required' }, { status: 400 });
  }

  try {
    // Find HN by CID
    const sql = 'SELECT hn FROM patient WHERE cid = ? LIMIT 1';
    const patients = await query(sql, [cid]);

    if (patients.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, hn: patients[0].hn });
  } catch (error) {
    console.error('Search by CID API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
