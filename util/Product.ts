import { executeQuery } from '@/lib/db';
import { getTokenUserData } from './token';

// 타입 정의
export interface ProductData {
  product_id?: string; // 자동 생성
  company_id: string; // 필수
  product_name: string; // 필수
  category?: string; // 기본값 '없음'
  price?: number; // 기본값 0
  standard?: string; // 규격
  unit?: string; // 단위
  description?: string; // 설명
  manufacturer?: string; // 제조업체
  start_date?: string; // 시작일자
  is_use?: string; // 기본값 '사용'
  image_url?: string; // 사진 URL
  count: number; // 기본값 0
}

// 제품 존재 여부 확인 (제품명으로)
export async function hasProduct(company_id: Buffer, product_name: string): Promise<boolean> {
  try {
    const sql = `
      SELECT COUNT(*) as count
      FROM product
      WHERE company_id = ? AND product_name = ?
    `;
    const params = [company_id, product_name];
    const result = await executeQuery(sql, params);
    return result[0].count > 0;
  } catch (error) {
    console.error('제품 존재 여부 확인 중 오류 발생:', error);
    throw error;
  }
}

// 제품 존재 여부 확인 (product_id로)
export async function hasProductById(company_id: Buffer, product_id: string): Promise<boolean> {
  try {
    const bufferId = Buffer.from(product_id.replace(/-/g, ''), 'hex');
    const sql = `
      SELECT COUNT(*) as count
      FROM product
      WHERE company_id = ? AND product_id = ?
    `;
    const params = [company_id, bufferId];
    const result = await executeQuery(sql, params);
    return result[0].count > 0;
  } catch (error) {
    console.error('제품 존재 여부 확인 중 오류 발생:', error);
    throw error;
  }
}

// 제품 삭제
export async function deleteProduct(product_id: string | undefined): Promise<boolean> {
  if (!product_id) {
    console.error('product_id가 제공되지 않았습니다.');
    return false;
  }

  const companyIdData = await getTokenUserData();
  const companyId = companyIdData['companyId'];
  const companyIdBuffer = Buffer.from(companyId['data'], 'hex');
  const bufferId = Buffer.from(product_id.replace(/-/g, ''), 'hex');

  const sql = `
    DELETE FROM product
    WHERE company_id = ? AND product_id = ?
  `;
  const params = [companyIdBuffer, bufferId];
  await executeQuery(sql, params);

  return true;
}

// 제품 생성
export async function insertProduct(productData: ProductData): Promise<boolean> {
  try {
    const companyIdData = await getTokenUserData();
    const companyId = companyIdData['companyId'];
    if (!companyId || !companyId['data']) {
      throw new Error('companyId를 찾을 수 없습니다.');
    }

    const companyIdBuffer = Buffer.from(companyId['data'], 'hex');

    // null 값 제거
    const sql = `
      INSERT INTO product (
        product_id,
        company_id,
        product_name,
        category,
        price,
        standard,
        unit,
        description,
        manufacturer,
        start_date,
        is_use,
        count,
        image_url
      ) VALUES (
        unhex(replace(uuid(),'-','')),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      companyIdBuffer,
      productData.product_name,
      productData.category || '없음',
      productData.price || 0,
      productData.standard || null,
      productData.unit || null,
      productData.description || null,
      productData.manufacturer || null,
      productData.start_date || null,
      productData.is_use || '사용',
      productData.count || 0,
      productData.image_url || null,
    ];

    await executeQuery(sql, params);
    return true;
  } catch (error) {
    console.error('제품 정보 삽입 중 오류 발생:', error);
    return false;
  }
}

// 제품 수정
export async function updateProduct(productData: ProductData): Promise<boolean> {
  if (!productData.product_id) {
    console.error('product_id가 제공되지 않았습니다.');
    return false;
  }

  try {
    const companyIdData = await getTokenUserData();
    const companyId = companyIdData['companyId'];
    if (!companyId || !companyId['data']) {
      throw new Error('companyId를 찾을 수 없습니다.');
    }

    const companyIdBuffer = Buffer.from(companyId['data'], 'hex');
    const bufferId = Buffer.from(productData.product_id.replace(/-/g, ''), 'hex');

    const fields: string[] = [];
    const params: any[] = [];

    // 업데이트할 필드 추가
    if (productData.product_name !== undefined) {
      fields.push('product_name = ?');
      params.push(productData.product_name);
    }
    if (productData.category !== undefined) {
      fields.push('category = ?');
      params.push(productData.category || null);
    }
    if (productData.price !== undefined) {
      fields.push('price = ?');
      params.push(productData.price || 0);
    }
    if (productData.standard !== undefined) {
      fields.push('standard = ?');
      params.push(productData.standard || null);
    }
    if (productData.unit !== undefined) {
      fields.push('unit = ?');
      params.push(productData.unit || null);
    }
    if (productData.description !== undefined) {
      fields.push('description = ?');
      params.push(productData.description || null);
    }
    if (productData.manufacturer !== undefined) {
      fields.push('manufacturer = ?');
      params.push(productData.manufacturer || null);
    }
    if (productData.start_date !== undefined) {
      fields.push('start_date = ?');
      params.push(productData.start_date);
    }
    if (productData.is_use !== undefined) {
      fields.push('is_use = ?');
      params.push(productData.is_use);
    }
    if (productData.count !== undefined) {
      fields.push('count = ?');
      params.push(productData.count || 0);
    }
    if (productData.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(productData.image_url || null);
    }

    if (fields.length === 0) {
      console.error('업데이트할 데이터가 없습니다.');
      return false;
    }

    const sql = `
      UPDATE product
      SET ${fields.join(', ')}
      WHERE company_id = ? AND product_id = ?
    `;

    params.push(companyIdBuffer, bufferId);
    await executeQuery(sql, params);

    return true;
  } catch (error) {
    console.error('제품 정보 업데이트 중 오류 발생:', error);
    return false;
  }
}
