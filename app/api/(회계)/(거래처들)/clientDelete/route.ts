import { deleteClient } from '@/util/Client';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await deleteClient(data?.business_number)) === true) {
      return NextResponse.json(
        {
          message: '클라이언가 성공적으로 삭제되었습니다.',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '존재하는 하지 않는 클라이언트입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '뭔가 이상함' }, { status: 415 });
  }
}
