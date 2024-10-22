import { updateClient } from '@/util/Client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await updateClient(data)) === true) {
      return NextResponse.json(
        {
          message: '클라이언트 수정 성공적',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '클라이언트 수정 실패, 존재하지 않는 클라이언트입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}
