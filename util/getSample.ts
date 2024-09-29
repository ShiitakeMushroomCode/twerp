import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // 사용자 입력값 가져오기
    const someParam = searchParams.get('param');

    // SQL 쿼리에서 파라미터 사용
    const data = await executeQuery('SELECT * FROM table WHERE column = ?', [someParam]);

    return NextResponse.json({
      data,
    });
  } catch (err: any) {
    throw err;
  }
}
