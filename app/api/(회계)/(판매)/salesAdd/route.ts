import { executeQuery } from '@/lib/db';
import { isEmpty } from '@/util/lo';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

    // sales_id 생성
    const salesId = Buffer.from(uuidv4().replace(/-/g, ''), 'hex');

    // 트랜잭션 시작
    await executeQuery('BEGIN');

    // sales 테이블에 데이터 삽입
    const salesInsertQuery = `
      INSERT INTO sales (
        sales_id,
        company_id,
        client_id,
        client_name,
        client_address,
        client_tel,
        client_fax,
        sale_date,
        description,
        transaction_type,
        collection,
        update_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const salesValues = [
      salesId,
      companyIdBuffer,
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
    ];

    await executeQuery(salesInsertQuery, salesValues);

    // sales_items 테이블에 데이터 삽입
    const salesItems = data.sales_items || [];

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
        salesId,
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

    // 트랜잭션 커밋
    await executeQuery('COMMIT');

    return NextResponse.json({ message: '성공적으로 추가됨', id: salesId['data'].toString('hex') }, { status: 200 });
  } catch (error) {
    console.error('오류남:', error);
    // 트랜잭션 롤백
    await executeQuery('ROLLBACK');
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
