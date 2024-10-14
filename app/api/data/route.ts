import { executeQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface DataRequestBody {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

interface Company {
  business_number: string;
  company_id: string;
  company_name: string;
  is_registered: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { searchTerm = '', page = 1, pageSize = 15 }: DataRequestBody = await request.json();

    const parsedPage = parseInt(page.toString(), 10) || 1;
    const limit = parseInt(pageSize.toString(), 10) || 15;
    const offset = (parsedPage - 1) * limit;

    let countQuery: string;
    let selectQuery: string;
    let params: any[] = [];
    let formattedSearchTerm: string;
    let countParams: any[] = [];
    let selectParams: any[] = [];

    if (searchTerm.trim() === '') {
      // 검색어가 비어있는 경우: 전체 데이터 조회
      countQuery = `SELECT COUNT(*) as total FROM company`;
      selectQuery = `SELECT business_number, HEX(company_id) as company_id, company_name, is_registered 
                     FROM company 
                     ORDER BY company_name ASC 
                     LIMIT ? OFFSET ?`;
      countParams = [];
      selectParams = [limit, offset];
    } else {
      // 검색어가 있는 경우: LIKE 검색 사용
      formattedSearchTerm = `%${searchTerm.trim()}%`; // 부분 매칭을 위한 '%' 추가

      countQuery = `SELECT COUNT(*) as total FROM company WHERE company_name LIKE ? OR business_number LIKE ?`;
      selectQuery = `SELECT business_number, HEX(company_id) as company_id, company_name, is_registered 
                     FROM company 
                     WHERE company_name LIKE ? OR business_number LIKE ? 
                     ORDER BY company_name ASC 
                     LIMIT ? OFFSET ?`;
      countParams = [formattedSearchTerm, formattedSearchTerm];
      selectParams = [formattedSearchTerm, formattedSearchTerm, limit, offset];
    }

    // 총 데이터 수 조회
    const countResult = await executeQuery(countQuery, countParams);
    const total: number = countResult[0]?.total || 0;

    // 페이징된 데이터 조회
    const data: Company[] = await executeQuery(selectQuery, selectParams);

    return NextResponse.json({ data, total }, { status: 200 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '데이터 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
