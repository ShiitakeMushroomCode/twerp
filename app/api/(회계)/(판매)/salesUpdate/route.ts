import { executeQuery } from '@/lib/db';
import { isEmpty } from '@/util/lo';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const data = await request.json();

    // 토큰에서 사용자 데이터 가져오기
    const tokenUserData = (await getTokenUserData()) as ACT;
    if (!tokenUserData || !tokenUserData['companyId'] || !tokenUserData['companyId']['data']) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyIdBuffer = Buffer.from(tokenUserData['companyId']['data'], 'hex');
    const salesIdBuffer = Buffer.from(data['sales_id'], 'hex');
    // console.log(salesIdBuffer);
    // console.log(companyIdBuffer);
    // sales 테이블에 데이터 업데이트
    const salesUpdateQuery = `
      UPDATE sales
      SET client_id = ?,
          client_name = ?,
          client_address = ?,
          client_tel = ?,
          client_fax = ?,
          sale_date = ?,
          description = ?,
          transaction_type = ?,
          collection = ?,
          update_at = ?
      WHERE sales_id = ?, company_id = ?
    `;

    const salesValues = [
      !isEmpty(data['client_id']) ? Buffer.from(data['client_id'], 'hex') : null,
      data['client_name'],
      data['client_address'] || null,
      data['client_tel'] || null,
      data['client_fax'] || null,
      data['sale_date'],
      data['description'] || null,
      data['transaction_type'],
      data['collection'],
      new Date(),
      salesIdBuffer,
      companyIdBuffer,
    ];

    await executeQuery(salesUpdateQuery, salesValues);

    // sales_items 테이블의 기존 항목 삭제 (sales_id 기준)
    const deleteSalesItemsQuery = `
      DELETE FROM sales_items WHERE sales_id = ?
    `;
    await executeQuery(deleteSalesItemsQuery, [salesIdBuffer]);

    // 새로운 sales_items 삽입
    const salesItems = data['sales_items'] || [];

    const salesItemsInsertQuery = `
      INSERT INTO sales_items (
        sales_item_id,
        sales_id,
        product_id,
        product_name,
        standard,
        price,
        sub_price,
        quantity,
        unit,
        description
      ) VALUES (unhex(replace(uuid(),'-','')), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of salesItems) {
      const productIdBuffer = !isEmpty(item['product_id']) ? Buffer.from(item['product_id'], 'hex') : null;

      const salesItemValues = [
        salesIdBuffer,
        productIdBuffer,
        item['product_name'],
        item['standard'] || null,
        item['price'],
        item['sub_price'],
        item['quantity'],
        item['unit'] || null,
        item['description'] || null,
      ];

      await executeQuery(salesItemsInsertQuery, salesItemValues);
    }

    return NextResponse.json({ message: '판매 기록이 성공적으로 업데이트되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('판매 기록 업데이트 실패:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
