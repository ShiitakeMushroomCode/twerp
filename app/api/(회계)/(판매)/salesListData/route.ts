import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, page, pageSize, sortColumn, sortOrder } = await request.json();

    // 페이지네이션을 위한 계산
    const offset = (page - 1) * pageSize;

    // 검색어 처리
    const searchCondition = searchTerm
      ? `AND (c.company_name LIKE ? OR s.description LIKE ? OR si.product_name LIKE ?)`
      : '';

    const searchParams = searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : [];

    // 정렬 가능한 컬럼 리스트 (SQL 인젝션 방지)
    const validSortColumns = ['company_name', 'items_name', 'total_amount', 'transaction_type'];
    const sortColumnSafe = validSortColumns.includes(sortColumn) ? sortColumn : 'company_name';

    // 정렬 순서 (asc 또는 desc)
    const sortOrderSafe = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // 총 데이터 수를 가져오기 위한 쿼리
    const countQuery = `
      SELECT COUNT(DISTINCT s.sales_id) AS total
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.clients_id
      LEFT JOIN sales_items si ON s.sales_id = si.sales_id
      WHERE 1=1 ${searchCondition}
    `;

    const countResult = await executeQuery(countQuery, searchParams);

    const total = countResult[0]?.total || 0;

    // 실제 데이터를 가져오기 위한 쿼리
    const dataQuery = `
      SELECT
        s.sales_id,
        COALESCE(c.company_name, s.client_name) AS company_name,
        s.transaction_type,
        s.description,
        (
          SELECT SUM(si.price * si.quantity)
          FROM sales_items si
          WHERE si.sales_id = s.sales_id
        ) AS total_amount,
        (
          SELECT GROUP_CONCAT(si.product_name SEPARATOR ', ')
          FROM sales_items si
          WHERE si.sales_id = s.sales_id
        ) AS item_names
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.clients_id
      WHERE 1=1 ${searchCondition}
      GROUP BY s.sales_id
      ORDER BY ${sortColumnSafe} ${sortOrderSafe}
      LIMIT ? OFFSET ?
    `;

    const dataResult = await executeQuery(dataQuery, [...searchParams, pageSize, offset]);

    // 데이터 형식을 프론트엔드에 맞게 변환
    const data = dataResult.map((row: any) => ({
      sales_id: Buffer.from(row.sales_id).toString('hex'),
      company_name: row.company_name,
      item_names: row.item_names ? row.item_names.split(', ') : [],
      total_amount: row.total_amount,
      transaction_type: row.transaction_type,
      description: row.description,
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ message: '데이터를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
