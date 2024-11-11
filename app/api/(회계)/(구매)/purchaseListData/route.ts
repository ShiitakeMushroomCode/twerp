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
      sortColumn = 'purchase_date',
      sortOrder = 'desc',
    } = await request.json();

    // 페이지와 페이지 사이즈 유효성 검사 및 기본값 설정
    const parsedPage = Number.isInteger(page) && page > 0 ? page : 1;
    const parsedPageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 15;

    // 페이지네이션 계산
    const offset = (parsedPage - 1) * parsedPageSize;

    // 검색어 처리
    let whereCondition = '';
    let havingCondition = '';
    let searchParams: any[] = [];

    if (searchTerm) {
      whereCondition += `
        AND (
          c.company_name LIKE ?
          OR s.supplier_name LIKE ?
          OR EXISTS (
            SELECT 1 FROM purchase_items si_search
            WHERE si_search.purchase_id = s.purchase_id
              AND si_search.product_name LIKE ?
          )
        )
      `;
      const formattedSearchTerm = `%${searchTerm.trim()}%`;
      searchParams.push(formattedSearchTerm, formattedSearchTerm, formattedSearchTerm);
    }

    // 추가 검색 옵션 처리
    if (searchOptions) {
      const { clientName, itemName, startDate, endDate, minAmount, maxAmount } = searchOptions;

      if (clientName) {
        whereCondition += `
          AND (
            c.company_name LIKE ?
            OR s.supplier_name LIKE ?
          )
        `;
        const formattedClientName = `%${clientName.trim()}%`;
        searchParams.push(formattedClientName, formattedClientName);
      }

      if (itemName) {
        // EXISTS 절을 사용하여 특정 itemName을 포함하는 purchase_id만 필터링
        whereCondition += `
          AND EXISTS (
            SELECT 1 FROM purchase_items si_filter
            WHERE si_filter.purchase_id = s.purchase_id
              AND si_filter.product_name LIKE ?
          )
        `;
        const formattedItemName = `%${itemName.trim()}%`;
        searchParams.push(formattedItemName);
      }

      if (startDate && endDate) {
        const parsedStartDate = parseISO(startDate);
        const parsedEndDate = parseISO(endDate);
        whereCondition += `
          AND s.purchase_date BETWEEN ? AND ?
        `;
        searchParams.push(parsedStartDate, parsedEndDate);
      } else if (startDate) {
        const parsedStartDate = parseISO(startDate);
        whereCondition += `
          AND s.purchase_date >= ?
        `;
        searchParams.push(parsedStartDate);
      } else if (endDate) {
        const parsedEndDate = parseISO(endDate);
        whereCondition += `
          AND s.purchase_date <= ?
        `;
        searchParams.push(parsedEndDate);
      }

      // 금액 필터는 HAVING 절에서 처리
      if (minAmount !== undefined && minAmount !== null) {
        havingCondition += `
          AND SUM((pi.price * pi.quantity) + pi.sub_price) >= ?
        `;
        searchParams.push(Number(minAmount));
      }

      if (maxAmount !== undefined && maxAmount !== null) {
        havingCondition += `
          AND SUM((pi.price * pi.quantity) + pi.sub_price) <= ?
        `;
        searchParams.push(Number(maxAmount));
      }
    }

    // 정렬 가능한 컬럼 리스트 (SQL 인젝션 방지)
    const validSortColumns = ['purchase_date', 'supplier_name', 'item_names', 'total_amount'];
    const sortColumnSafe = validSortColumns.includes(sortColumn) ? sortColumn : 'purchase_date';
    const sortOrderSafe = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // 기본값은 'DESC'

    // 총 데이터 수를 가져오기 위한 쿼리
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT s.purchase_id
        FROM purchases s
        LEFT JOIN clients c ON s.supplier_id = c.clients_id
        LEFT JOIN purchase_items pi ON s.purchase_id = pi.purchase_id
        WHERE 1=1 ${whereCondition}
        GROUP BY s.purchase_id
        HAVING 1=1 ${havingCondition}
      ) AS count_subquery
    `;

    const countResult = await executeQuery(countQuery, searchParams);
    const total = countResult[0]?.total || 0;

    // 실제 데이터를 가져오기 위한 쿼리
    const dataQuery = `
      SELECT
        s.purchase_id,
        COALESCE(c.company_name, s.supplier_name) AS supplier_name,
        s.transaction_type,
        s.description,
        s.purchase_date,
        s.update_at,
        SUM((pi.price * pi.quantity) + pi.sub_price) AS total_amount,
        GROUP_CONCAT(pi.product_name SEPARATOR ', ') AS item_names,
        ROW_NUMBER() OVER (PARTITION BY s.purchase_date ORDER BY s.update_at ASC) AS sequence_number,
        s.collection
      FROM purchases s
      LEFT JOIN clients c ON s.supplier_id = c.clients_id
      LEFT JOIN purchase_items pi ON s.purchase_id = pi.purchase_id
      WHERE 1=1 ${whereCondition}
      GROUP BY s.purchase_id
      HAVING 1=1 ${havingCondition}
      ORDER BY ${sortColumnSafe} ${sortOrderSafe}, purchase_date DESC, update_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...searchParams, pageSize, offset];

    const dataResult = await executeQuery(dataQuery, dataParams);

    // 데이터 형식을 프론트엔드에 맞게 변환
    const data = dataResult.map((row: any) => ({
      purchase_id: Buffer.from(row.purchase_id).toString('hex'),
      supplier_name: row.supplier_name,
      item_names: row.item_names ? row.item_names.split(', ') : [],
      total_amount: row.total_amount,
      transaction_type: row.transaction_type,
      description: row.description,
      purchase_date: row.purchase_date,
      update_at: row.update_at,
      sequence_number: row.sequence_number,
      collection: row.collection,
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ message: '데이터를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
