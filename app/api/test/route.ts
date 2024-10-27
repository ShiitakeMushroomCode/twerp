import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(req: NextRequest, res: NextResponse) {
  const page = parseInt('1') || 1; // 기본값은 1
  const limit = 10;
  const offset = (page - 1) * limit;
  const data = await executeQuery(`SELECT * FROM company LIMIT ? OFFSET ?`, [limit, offset]);
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // 응답을 반환
    return new Response(JSON.stringify({ message: 'Data inserted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error inserting data', error }), { status: 500 });
  }
}
