import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const { pathname } = new URL(request.url);

  // 로깅 API 호출
  try {
    await fetch(`${process.env.API_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pathname, method: 'GET' }),
    });
  } catch (error) {
    console.error('로깅 API 호출 실패:', error);
  }

  return NextResponse.json({ error: '존재하지 않는 API 입니다.' }, { status: 404 });
}

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);

  // 로깅 API 호출
  try {
    await fetch(`${process.env.API_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pathname, method: 'POST' }),
    });
  } catch (error) {
    console.error('로깅 API 호출 실패:', error);
  }
  return NextResponse.json({ error: '존재하지 않는 API 입니다.' }, { status: 404 });
}
