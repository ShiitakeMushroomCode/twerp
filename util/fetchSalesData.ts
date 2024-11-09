'use server';

import { SalesPrintFormData } from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';

export async function fetchSalesData(id: string): Promise<SalesPrintFormData> {
  const data = (await getTokenUserData()) as ACT;
  const companyIdBuffer = Buffer.from(data.companyId['data'], 'hex');
  const salesIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, salesResult, salesItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
  ]);
  return {
    companyResult: transformBufferFields(companyResult[0]),
    salesResult: transformBufferFields(salesResult[0]),
    salesItemsResult: salesItemsResult.map((item) => transformBufferFields(item)),
  };
}

// Buffer 필드를 hex 문자열로 변환하는 함수
function transformBufferFields(data: Record<string, any>): Record<string, any> {
  const transformedData: Record<string, any> = {};
  for (const key in data) {
    transformedData[key] = Buffer.isBuffer(data[key]) ? data[key].toString('hex') : data[key];
  }
  return transformedData;
}
