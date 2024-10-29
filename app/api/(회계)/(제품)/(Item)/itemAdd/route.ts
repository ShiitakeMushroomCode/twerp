import { insertProduct } from '@/util/Product';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await insertProduct(data)) === true) {
      return NextResponse.json(
        {
          message: '제품 생성 성공했습니다.',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '이미 존재하는 제품입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}
