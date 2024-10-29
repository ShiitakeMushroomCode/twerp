import { deleteProduct } from '@/util/Product';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    if ((await deleteProduct(data?.product_id)) === true) {
      return NextResponse.json(
        {
          message: '제품 삭제를 성공했습니다.',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: '존재하지 않는 제품입니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('서버 측 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}
