import { insertClient } from '@/util/Client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await insertClient(data)) === true) {
      return NextResponse.json(
        {
          message: '클라이언트 생성 성공적',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '이미 존재하는 클라이언트입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '뭔가 이상함' }, { status: 415 });
  }
}
