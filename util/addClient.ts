import { executeQuery } from '@/lib/db';
import { getTokenUserData } from './token';

// 클라이언트 검증
export async function hasClient(company_id: Buffer, business_number: string): Promise<boolean> {
  try {
    const sql = `
      SELECT COUNT(*) as count
      FROM clients
      WHERE company_id = ? AND business_number = ?
    `;

    const params = [company_id, business_number];
    const result = await executeQuery(sql, params);
    return result[0].count > 0;
  } catch (error) {
    console.error('클라이언트 존재 여부 확인 중 오류 발생:', error);
    throw error;
  }
}

interface ClientData {
  business_number: string;
  company_name: string;
  representative_name?: string;
  business_address?: string;
  billing_email?: string;
  tell_number?: string;
  fax_number?: string;
  start_date?: string;
  business_status?: string;
  main_item_name?: string;
}

// 클라이언트 생성
export async function insertClient(clientData: ClientData): Promise<boolean> {
  try {
    const companyId = (await getTokenUserData())['companyId'];
    if (!(await hasClient(Buffer.from(companyId['data']), clientData.business_number))) {
      const sql = `
      INSERT INTO clients (
        company_id,
        business_number,
        company_name,
        representative_name,
        business_address,
        billing_email,
        tell_number,
        fax_number,
        start_date,
        business_status,
        main_item_name
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

      const params = [
        Buffer.from(companyId['data']),
        clientData.business_number,
        clientData.company_name,
        clientData.representative_name || null,
        clientData.business_address || null,
        clientData.billing_email || null,
        clientData.tell_number || null,
        clientData.fax_number || null,
        clientData.start_date || null,
        clientData.business_status || null,
        clientData.main_item_name || null,
      ];

      // console.log('쿼리 실행:', sql);
      // console.log('파라미터:', params);

      await executeQuery(sql, params);

      console.log('클라이언트 정보가 성공적으로 삽입되었습니다.');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('클라이언트 정보 삽입 중 오류 발생:', error);
    return false;
  }
}
