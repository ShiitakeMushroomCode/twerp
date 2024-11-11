import { executeQuery } from '@/lib/db';
import { isEmpty } from '@/util/lo';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const tokenUserData = (await getTokenUserData()) as ACT;

    if (!tokenUserData || !tokenUserData['companyId'] || !tokenUserData['companyId']['data']) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyIdBuffer = Buffer.from(tokenUserData['companyId']['data'], 'hex');
    const purchaseIdString = uuidv4().replace(/-/g, '');
    const purchaseId = Buffer.from(purchaseIdString, 'hex');

    await executeQuery('BEGIN');

    const purchaseInsertQuery = `
      INSERT INTO purchases (
        purchase_id,
        company_id,
        supplier_id,
        supplier_name,
        supplier_address,
        supplier_tel,
        supplier_fax,
        purchase_date,
        description,
        transaction_type,
        collection,
        update_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const purchaseValues = [
      purchaseId,
      companyIdBuffer,
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
    ];

    await executeQuery(purchaseInsertQuery, purchaseValues);

    const purchaseItems = data.purchase_items || [];

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
        purchaseId,
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

    await executeQuery('COMMIT');

    return NextResponse.json({ message: '성공적으로 추가됨', id: purchaseIdString }, { status: 200 });
  } catch (error) {
    console.error('오류남:', error);
    await executeQuery('ROLLBACK');
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}
