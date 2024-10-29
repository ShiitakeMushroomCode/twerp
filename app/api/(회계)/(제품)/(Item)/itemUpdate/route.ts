import { updateProduct } from '@/util/Product';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await updateProduct(data)) === true) {
      return NextResponse.json(
        {
          message: '제품 수정 성공적',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '제품 수정 실패, 존재하지 않는 제품입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}
