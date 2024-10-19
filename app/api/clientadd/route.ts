import { insertClient } from '@/util/addClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    await insertClient(data);

    return NextResponse.json(
      {
        message: '클라이언트 생성 성공적',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '뭔가 이상함' }, { status: 415 });
  }
}
