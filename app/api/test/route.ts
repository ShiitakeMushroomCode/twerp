import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
    // 요청 본문에서 데이터를 JSON 형식으로 가져옴
    const body = await req.json();

    // body에서 필요한 데이터를 꺼냄 (예: name, email 등)
    const { name, email } = body;

    // DB 쿼리 실행 (필요한 로직 적용)
    const result = await executeQuery('INSERT INTO company (name, email) VALUES (?, ?)', [name, email]);

    // 응답을 반환
    return new Response(JSON.stringify({ message: 'Data inserted successfully', result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error inserting data', error }), { status: 500 });
  }
}
