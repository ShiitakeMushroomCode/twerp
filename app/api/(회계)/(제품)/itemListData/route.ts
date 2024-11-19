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

interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  manufacturer: string;
  is_use: string;
}

// 제품 데이터를 페이징 및 검색하여 반환하는 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 파라미터 추출
    let { searchTerm = '', page = 1, pageSize = 15, sortColumn, sortOrder }: DataRequestBody = await request.json();

    // sortColumn과 sortOrder에 기본값 적용
    sortColumn = sortColumn || 'product_name';
    sortOrder = sortOrder || 'asc';

    // page가 정수인지 체크하고, 아니면 기본값인 1로 설정
    page = Number.isInteger(page) && page > 0 ? page : 1;

    // pageSize가 정수인지 체크하고, 아니면 기본값인 15로 설정
    pageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 15;

    // limit과 offset 계산
    const limit = pageSize; // pageSize를 limit으로 사용
    const offset = (page - 1) * limit;

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

    // 허용된 정렬 컬럼인지 검증
    const allowedSortColumns = ['product_name', 'category', 'price', 'manufacturer', 'is_use'];
    if (!allowedSortColumns.includes(sortColumn)) {
      throw new Error('Invalid sort column');
    }

    // 정렬 순서 검증
    const sortOrderUpper = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // 정렬 문자열 생성 (SQL 인젝션 방지를 위해 컬럼명과 정렬 순서 검증 완료)
    const orderByClause = `ORDER BY ${sortColumn} ${sortOrderUpper}`;

    if (searchTerm.trim() === '') {
      // 전체 제품 수와 데이터를 조회하는 쿼리
      countQuery = `SELECT COUNT(*) as total FROM product WHERE company_id = ?`;
      selectQuery = `
        SELECT
          HEX(product_id) as product_id,
          product_name,
          category,
          price,
          manufacturer,
          is_use,
          description
        FROM product
        WHERE company_id = ?
        ${orderByClause}
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      countParams = [companyIdBuffer];
      selectParams = [companyIdBuffer];
    } else {
      // 검색 조건에 맞는 제품 수와 데이터를 조회하는 쿼리
      countQuery = `
        SELECT COUNT(*) as total
        FROM product
        WHERE company_id = ? 
        AND (
          product_name LIKE ? 
          OR category LIKE ? 
          OR manufacturer LIKE ?
          OR is_use LIKE ?
        )
      `;

      selectQuery = `
        SELECT
          HEX(product_id) as product_id,
          product_name,
          category,
          price,
          manufacturer,
          is_use,
          description
        FROM product
        WHERE company_id = ? 
        AND (
          product_name LIKE ? 
          OR category LIKE ? 
          OR manufacturer LIKE ?
          OR is_use LIKE ?
        )
        ${orderByClause}
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;

      // 검색 파라미터에 'is_use' 추가
      countParams = [
        companyIdBuffer,
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
      ];
    }

    // 총 제품 수를 조회
    const countResult = await executeQuery(countQuery, countParams);
    const total: number = countResult[0]?.total || 0;

    // 제품 데이터를 조회
    const data: Product[] = await executeQuery(selectQuery, selectParams);

    // 조회된 데이터와 총 개수를 반환
    return NextResponse.json({ data, total }, { status: 200 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '데이터 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
