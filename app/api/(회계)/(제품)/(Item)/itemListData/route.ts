import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

interface DataRequestBody {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
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
    // 요청 본문에서 검색어와 페이징 정보를 추출
    const { searchTerm = '', page = 1, pageSize = 15 }: DataRequestBody = await request.json();

    const parsedPage = parseInt(page.toString(), 10) || 1;
    const limit = parseInt(pageSize.toString(), 10) || 15;
    const offset = (parsedPage - 1) * limit;

    // 토큰에서 companyId를 가져와서 Buffer로 변환
    const tokenUserData = await getTokenUserData();
    const companyId = tokenUserData['companyId'];
    const companyIdBuffer = Buffer.from(companyId['data']);

    let countQuery: string;
    let selectQuery: string;
    let countParams: any[] = [];
    let selectParams: any[] = [];
    const formattedSearchTerm = `%${searchTerm.trim()}%`;

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
          is_use
        FROM product
        WHERE company_id = ?
        ORDER BY product_name ASC
        LIMIT ? OFFSET ?
      `;
      countParams = [companyIdBuffer];
      selectParams = [companyIdBuffer, limit, offset];
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
        )
      `;

      selectQuery = `
        SELECT
          HEX(product_id) as product_id,
          product_name,
          category,
          price,
          manufacturer,
          is_use
        FROM product
        WHERE company_id = ? 
        AND (
          product_name LIKE ? 
          OR category LIKE ? 
          OR manufacturer LIKE ?
        )
        ORDER BY product_name ASC
        LIMIT ? OFFSET ?
      `;

      countParams = [
        companyIdBuffer,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
      ];
      selectParams = [
        companyIdBuffer,
        formattedSearchTerm,
        formattedSearchTerm,
        formattedSearchTerm,
        limit,
        offset,
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
