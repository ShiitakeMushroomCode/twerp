import { executeQuery } from '@/lib/db';
import { isEmpty } from '@/util/lo';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const tokenUserData = (await getTokenUserData()) as ACT;

    if (!tokenUserData || !tokenUserData['companyId'] || !tokenUserData['companyId']['data']) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyIdBuffer = Buffer.from(tokenUserData['companyId']['data'], 'hex');
    const purchaseIdBuffer = Buffer.from(data['purchase_id'], 'hex');

    const purchaseUpdateQuery = `
      UPDATE purchases
      SET supplier_id = ?,
          supplier_name = ?,
          supplier_address = ?,
          supplier_tel = ?,
          supplier_fax = ?,
          purchase_date = ?,
          description = ?,
          transaction_type = ?,
          collection = ?,
          update_at = ?
      WHERE purchase_id = ? AND company_id = ?
    `;

    const purchaseValues = [
      !isEmpty(data['supplier_id']) ? Buffer.from(data['supplier_id'], 'hex') : null,
      data['supplier_name'],
      data['supplier_address'] || null,
      data['supplier_tel'] || null,
      data['supplier_fax'] || null,
      data['purchase_date'],
      data['description'] || null,
      data['transaction_type'],
      data['collection'],
      new Date(),
      purchaseIdBuffer,
      companyIdBuffer,
    ];

    await executeQuery(purchaseUpdateQuery, purchaseValues);

    const deletePurchaseItemsQuery = `
      DELETE FROM purchase_items WHERE purchase_id = ?
    `;
    await executeQuery(deletePurchaseItemsQuery, [purchaseIdBuffer]);

    const purchaseItems = data['purchase_items'] || [];

    const purchaseItemsInsertQuery = `
      INSERT INTO purchase_items (
        purchase_item_id,
        purchase_id,
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

    for (const item of purchaseItems) {
      const productIdBuffer = !isEmpty(item['product_id']) ? Buffer.from(item['product_id'], 'hex') : null;

      const purchaseItemValues = [
        purchaseIdBuffer,
        productIdBuffer,
        item['product_name'],
        item['standard'] || null,
        item['price'],
        item['sub_price'],
        item['quantity'],
        item['unit'] || null,
        item['description'] || null,
      ];

      await executeQuery(purchaseItemsInsertQuery, purchaseItemValues);
    }

    return NextResponse.json(
      { message: '구매 기록이 성공적으로 업데이트되었습니다.', id: data['purchase_id'] },
      { status: 200 }
    );
  } catch (error) {
    console.error('구매 기록 업데이트 실패:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
