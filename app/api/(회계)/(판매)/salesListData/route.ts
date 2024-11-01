import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, page, pageSize, sortColumn, sortOrder } = await request.json();

    // 페이지네이션 계산
    const offset = (page - 1) * pageSize;

    // 검색어 처리
    const formattedSearchTerm = `%${searchTerm}%`;

    // SQL 인젝션 방지를 위한 정렬 가능한 컬럼 검증
    const validSortColumns = ['sale_date', 'company_name', 'item_names', 'total_amount'];
    const sortColumnSafe = validSortColumns.includes(sortColumn) ? sortColumn : 'sale_date';
    const sortOrderSafe = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 기본 쿼리 구성
    const baseQuery = `
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.clients_id
      LEFT JOIN sales_items si ON s.sales_id = si.sales_id
      WHERE 1=1
    `;

    // 검색 조건 구성
    let searchCondition = '';
    let searchParams = [];

    if (searchTerm) {
      searchCondition = `
        AND (
          c.company_name LIKE ?
          OR s.client_name LIKE ?
          OR si.product_name LIKE ?
        )
      `;
      searchParams.push(formattedSearchTerm, formattedSearchTerm, formattedSearchTerm);
    }

    // 총 개수 계산 쿼리
    const countQuery = `
      SELECT COUNT(DISTINCT s.sales_id) AS total
      ${baseQuery}
      ${searchCondition}
    `;

    const countResult = await executeQuery(countQuery, searchParams);
    const total = countResult[0]?.total || 0;

    // 데이터 조회 쿼리
    const dataQuery = `
      SELECT
        s.sales_id,
        COALESCE(c.company_name, s.client_name) AS company_name,
        s.transaction_type,
        s.description,
        s.sale_date,
        s.update_at,
        SUM((si.price + si.sub_price) * si.quantity) AS total_amount,
        GROUP_CONCAT(DISTINCT si.product_name ORDER BY si.product_name SEPARATOR ', ') AS item_names,
        ROW_NUMBER() OVER (ORDER BY s.sale_date DESC, s.update_at DESC) AS sequence_number
      ${baseQuery}
      ${searchCondition}
      GROUP BY s.sales_id
      ORDER BY ${sortColumnSafe} ${sortOrderSafe}, s.sale_date DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...searchParams, pageSize, offset];

    const dataResult = await executeQuery(dataQuery, dataParams);

    const data = dataResult.map((row) => ({
      sales_id: Buffer.from(row.sales_id).toString('hex'),
      company_name: row.company_name,
      item_names: row.item_names ? row.item_names.split(', ') : [],
      total_amount: row.total_amount,
      transaction_type: row.transaction_type,
      description: row.description,
      sale_date: row.sale_date,
      update_at: row.update_at,
      sequence_number: row.sequence_number,
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ message: '데이터를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
