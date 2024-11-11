import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { purchase_id } = await request.json();
    const tokenUserData = (await getTokenUserData()) as ACT;

    if (!tokenUserData || !tokenUserData['companyId'] || !tokenUserData['companyId']['data']) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const purchaseIdBuffer = Buffer.from(purchase_id, 'hex');
    const companyIdBuffer = Buffer.from(tokenUserData['companyId']['data'], 'hex');

    await executeQuery('BEGIN');

    const deletePurchaseQuery = `
      DELETE FROM purchases
      WHERE purchase_id = ? AND company_id = ?
    `;
    await executeQuery(deletePurchaseQuery, [purchaseIdBuffer, companyIdBuffer]);

    await executeQuery('COMMIT');

    return NextResponse.json({ message: '구매 기록이 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('삭제 중 오류:', error);
    await executeQuery('ROLLBACK');
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
