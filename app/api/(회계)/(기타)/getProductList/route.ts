import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const search: string | null = searchParams.get('search') || '';
  const offset: number = parseInt(searchParams.get('offset') || '0');
  const limit: number = parseInt(searchParams.get('limit') || '5');

  const user = await getTokenUserData();
  const companyId = Buffer.from(user['companyId'], 'hex');

  // 기본 SQL 쿼리
  let baseSql = `
    FROM
      product
    WHERE
      company_id = ?
      AND is_use = '사용'
  `;

  const params: any[] = [companyId];

  if (search) {
    baseSql += `
      AND (
        product_name LIKE ?
        OR category LIKE ?
        OR manufacturer LIKE ?
      )
    `;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // 총 개수 쿼리
  const countSql = `
    SELECT COUNT(*) as totalCount
    ${baseSql}
  `;

  // 데이터 쿼리
  const dataSql = `
    SELECT
      *
    ${baseSql}
    ORDER BY product_name
    LIMIT ?
    OFFSET ?
  `;

  params.push(limit, offset);

  try {
    // 총 개수 가져오기
    const countResult = await executeQuery(countSql, params.slice(0, params.length - 2));
    const totalCount = countResult[0].totalCount;

    // 데이터 가져오기
    const Data = await executeQuery(dataSql, params);
    const fData = Data.map((item: any) => ({
      ...item,
      product_id: item.product_id.toString('hex'),
    }));
    return new Response(JSON.stringify({ fData, totalCount }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
