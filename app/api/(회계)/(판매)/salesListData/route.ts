import { executeQuery } from '@/lib/db';
import { parseISO } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const {
      searchTerm,
      searchOptions,
      page = 1,
      pageSize = 15,
      sortColumn = 'sale_date',
      sortOrder = 'desc',
    } = await request.json();

    // 페이지네이션 계산
    const offset = (page - 1) * pageSize;

    // 검색어 처리
    let searchCondition = '';
    let searchParams: any[] = [];

    if (searchTerm) {
      searchCondition += `
        AND (
          c.company_name LIKE ?
          OR s.description LIKE ?
          OR si.product_name LIKE ?
        )
      `;
      const formattedSearchTerm = `%${searchTerm.trim()}%`;
      searchParams.push(formattedSearchTerm, formattedSearchTerm, formattedSearchTerm);
    }

    // 추가 검색 옵션 처리
    if (searchOptions) {
      const { clientName, startDate, endDate, minAmount, maxAmount } = searchOptions;

      if (clientName) {
        searchCondition += `
          AND (
            c.company_name LIKE ?
            OR s.client_name LIKE ?
          )
        `;
        const formattedClientName = `%${clientName.trim()}%`;
        searchParams.push(formattedClientName, formattedClientName);
      }

      if (startDate && endDate) {
        const parsedStartDate = parseISO(startDate);
        const parsedEndDate = parseISO(endDate);
        searchCondition += `
          AND s.sale_date BETWEEN ? AND ?
        `;
        searchParams.push(parsedStartDate, parsedEndDate);
      } else if (startDate) {
        const parsedStartDate = parseISO(startDate);
        searchCondition += `
          AND s.sale_date >= ?
        `;
        searchParams.push(parsedStartDate);
      } else if (endDate) {
        const parsedEndDate = parseISO(endDate);
        searchCondition += `
          AND s.sale_date <= ?
        `;
        searchParams.push(parsedEndDate);
      }

      if (minAmount !== undefined && minAmount !== null && minAmount !== '') {
        searchCondition += `
          AND total_amount >= ?
        `;
        searchParams.push(Number(minAmount));
      }

      if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') {
        searchCondition += `
          AND total_amount <= ?
        `;
        searchParams.push(Number(maxAmount));
      }
    }

    // 정렬 가능한 컬럼 리스트 (SQL 인젝션 방지)
    const validSortColumns = ['sale_date', 'company_name', 'item_names', 'total_amount'];
    const sortColumnSafe = validSortColumns.includes(sortColumn) ? sortColumn : 'sale_date';
    const sortOrderSafe = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // 기본값은 'DESC'

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
      SELECT * FROM (
        SELECT
          s.sales_id,
          COALESCE(c.company_name, s.client_name) AS company_name,
          s.transaction_type,
          s.description,
          s.sale_date,
          s.update_at,
          (
            SELECT SUM((si.price + si.sub_price) * si.quantity)
            FROM sales_items si
            WHERE si.sales_id = s.sales_id
          ) AS total_amount,
          (
            SELECT GROUP_CONCAT(si.product_name SEPARATOR ', ')
            FROM sales_items si
            WHERE si.sales_id = s.sales_id
          ) AS item_names,
          ROW_NUMBER() OVER (PARTITION BY s.sale_date ORDER BY s.update_at DESC) AS sequence_number
        FROM sales s
        LEFT JOIN clients c ON s.client_id = c.clients_id
        WHERE 1=1 ${searchCondition}
        GROUP BY s.sales_id
      ) AS subquery
      ORDER BY ${sortColumnSafe} ${sortOrderSafe}, sale_date DESC, update_at
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...searchParams, pageSize, offset];

    const dataResult = await executeQuery(dataQuery, dataParams);

    // 데이터 형식을 프론트엔드에 맞게 변환
    const data = dataResult.map((row: any) => ({
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
