import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

interface DataRequestBody {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Client {
  business_number: string;
  clients_id: string;
  company_name: string;
  representative_name: string;
  tell_number: string;
  fax_number: string;
}

// 클라이언트 데이터를 페이징 및 검색하여 반환하는 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 검색어와 페이징 정보를 추출
    let { searchTerm = '', page = 1, pageSize = 15, sortColumn, sortOrder }: DataRequestBody = await request.json();

    // **sortColumn과 sortOrder에 기본값 적용**
    sortColumn = sortColumn || 'company_name';
    sortOrder = sortOrder || 'asc';

    const parsedPage = parseInt(page.toString(), 10) || 1;
    const limit = parseInt(pageSize.toString(), 10) || 15;
    const offset = (parsedPage - 1) * limit;

    // 숫자형으로 변환하여 SQL 인젝션 방지
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    // 토큰에서 companyId를 가져와서 Buffer로 변환
    const tokenUserData = await getTokenUserData();
    const companyId = tokenUserData['companyId'];
    const companyIdBuffer = Buffer.from(companyId['data'], 'hex');

    let countQuery: string;
    let selectQuery: string;
    let countParams: any[] = [];
    let selectParams: any[] = [];
    const formattedSearchTerm = `%${searchTerm.trim()}%`;

    // **허용된 정렬 컬럼인지 검증**
    const allowedSortColumns = ['business_number', 'company_name', 'representative_name', 'tell_number', 'fax_number'];
    if (!allowedSortColumns.includes(sortColumn)) {
      throw new Error('Invalid sort column');
    }

    // **정렬 순서 검증**
    const sortOrderUpper = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // **정렬 문자열 생성**
    const orderByClause = `ORDER BY ${sortColumn} ${sortOrderUpper}`;

    if (searchTerm.trim() === '') {
      // 전체 클라이언트 수와 데이터를 조회하는 쿼리
      countQuery = `SELECT COUNT(*) as total FROM clients WHERE company_id = ?`;
      selectQuery = `
        SELECT
          business_number,
          HEX(clients_id) as clients_id,
          company_name,
          representative_name,
          tell_number,
          fax_number 
        FROM clients
        WHERE company_id = ?
        ${orderByClause}
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      countParams = [companyIdBuffer];
      selectParams = [companyIdBuffer];
    } else {
      // 검색 조건에 맞는 클라이언트 수와 데이터를 조회하는 쿼리
      countQuery = `
        SELECT COUNT(*) as total
        FROM clients
        WHERE company_id = ? 
        AND (
          company_name LIKE ? 
          OR business_number LIKE ? 
          OR representative_name LIKE ?
          OR tell_number LIKE ?
          OR fax_number LIKE ?
        )
      `;

      selectQuery = `
        SELECT
          business_number,
          HEX(clients_id) as clients_id,
          company_name,
          representative_name,
          tell_number,
          fax_number 
        FROM clients
        WHERE company_id = ? 
        AND (
          company_name LIKE ? 
          OR business_number LIKE ? 
          OR representative_name LIKE ?
          OR tell_number LIKE ?
          OR fax_number LIKE ?
        )
        ${orderByClause}
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;

      countParams = [
        companyIdBuffer,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
      ];
      selectParams = [
        companyIdBuffer,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
      ];
    }

    // 총 클라이언트 수를 조회
    const countResult = await executeQuery(countQuery, countParams);
    const total: number = countResult[0]?.total || 0;

    // 클라이언트 데이터를 조회
    const data: Client[] = await executeQuery(selectQuery, selectParams);

    // 조회된 데이터와 총 개수를 반환
    return NextResponse.json({ data, total }, { status: 200 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '데이터 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
