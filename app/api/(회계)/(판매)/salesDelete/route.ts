import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // 요청 본문에서 삭제할 sales_id를 가져옴
    const { sales_id } = await request.json();

    // 토큰에서 사용자 데이터 가져오기
    const tokenUserData = (await getTokenUserData()) as ACT;
    if (!tokenUserData || !tokenUserData['companyId'] || !tokenUserData['companyId']['data']) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const salesIdBuffer = Buffer.from(sales_id, 'hex');
    // companyId 버퍼로 변환
    const companyIdBuffer = Buffer.from(tokenUserData['companyId']['data'], 'hex');

    // 트랜잭션 시작
    await executeQuery('BEGIN');

    // sales 테이블에서 해당 sales_id 데이터 삭제
    const deleteSalesQuery = `
      DELETE FROM sales
      WHERE sales_id = ? AND company_id = ?
    `;
    await executeQuery(deleteSalesQuery, [salesIdBuffer, companyIdBuffer]);

    // 트랜잭션 커밋
    await executeQuery('COMMIT');

    return NextResponse.json({ message: '매출 기록이 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('삭제 중 오류:', error);
    // 트랜잭션 롤백
    await executeQuery('ROLLBACK');
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
