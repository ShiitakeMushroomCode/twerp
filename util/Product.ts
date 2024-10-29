import { executeQuery } from '@/lib/db';
import { getTokenUserData } from './token';

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
    if (!product_id) {
      throw new Error('product_id가 제공되지 않았습니다.');
    }

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
  if (!companyId || !companyId['data']) {
    throw new Error('companyId를 찾을 수 없습니다.');
  }

  const companyIdBuffer = Buffer.from(companyId['data']);

  if (await hasProductById(companyIdBuffer, product_id)) {
    const bufferId = Buffer.from(product_id.replace(/-/g, ''), 'hex');
    const sql = `
      DELETE FROM product
      WHERE company_id = ? AND product_id = ?
    `;

    const params = [companyIdBuffer, bufferId];
    await executeQuery(sql, params);

    console.log('제품 정보가 성공적으로 삭제되었습니다.');
    return true;
  } else {
    console.log('삭제할 제품이 존재하지 않습니다.');
    return false;
  }
}

interface ProductData {
  product_id?: string;
  product_name: string;
  category?: string;
  price?: number;
  manufacturer?: string;
  start_date?: string;
  is_use?: string;
  description?: string;
  image_url?: string;
}

// 제품 생성
export async function insertProduct(productData: ProductData): Promise<boolean> {
  try {
    const companyIdData = await getTokenUserData();
    const companyId = companyIdData['companyId'];
    if (!companyId || !companyId['data']) {
      throw new Error('companyId를 찾을 수 없습니다.');
    }

    const companyIdBuffer = Buffer.from(companyId['data']);

    if (!(await hasProduct(companyIdBuffer, productData.product_name))) {
      const sql = `
        INSERT INTO product (
          product_id,
          company_id,
          product_name,
          category,
          price,
          manufacturer,
          start_date,
          is_use,
          description,
          image_url
        ) VALUES (
          UUID_TO_BIN(UUID()),
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `;

      const params = [
        companyIdBuffer,
        productData.product_name,
        productData.category || null,
        productData.price || null,
        productData.manufacturer || null,
        productData.start_date || null,
        productData.is_use || '사용',
        productData.description || null,
        productData.image_url || null,
      ];

      await executeQuery(sql, params);

      console.log('제품 정보가 성공적으로 삽입되었습니다.');
      return true;
    } else {
      console.log('이미 존재하는 제품입니다.');
      return false;
    }
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

    const companyIdBuffer = Buffer.from(companyId['data']);

    if (await hasProductById(companyIdBuffer, productData.product_id)) {
      const bufferId = Buffer.from(productData.product_id.replace(/-/g, ''), 'hex');
      const sql = `
        UPDATE product
        SET
          product_name = ?,
          category = ?,
          price = ?,
          manufacturer = ?,
          start_date = ?,
          is_use = ?,
          description = ?,
          image_url = ?
        WHERE
          company_id = ? AND product_id = ?
      `;

      const params = [
        productData.product_name,
        productData.category || null,
        productData.price || null,
        productData.manufacturer || null,
        productData.start_date || null,
        productData.is_use || '사용',
        productData.description || null,
        productData.image_url || null,
        companyIdBuffer,
        bufferId,
      ];

      await executeQuery(sql, params);

      console.log('제품 정보가 성공적으로 업데이트되었습니다.');
      return true;
    } else {
      console.log('업데이트할 제품이 존재하지 않습니다.');
      return false;
    }
  } catch (error) {
    console.error('제품 정보 업데이트 중 오류 발생:', error);
    return false;
  }
}
