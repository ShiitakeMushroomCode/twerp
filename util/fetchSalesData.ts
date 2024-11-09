'use server';

import {
  CompanyResult,
  SalesItemResult,
  SalesPrintFormData,
  SalesResult,
} from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
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
    companyResult: companyResult[0],
    salesResult: salesResult[0],
    salesItemsResult,
  };
}

export async function fetchSalesData2(id: string): Promise<SalesPrintFormData> {
  const data = (await getTokenUserData()) as ACT;
  const companyIdBuffer = Buffer.from(data.companyId['data'], 'hex');
  const salesIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, salesResult, salesItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
  ]);

  return {
    companyResult: transformBufferFields<CompanyResult>(companyResult[0]),
    salesResult: transformBufferFields<SalesResult>(salesResult[0]),
    salesItemsResult: salesItemsResult.map((item) => transformBufferFields<SalesItemResult>(item)),
  };
}

function transformBufferFields<T>(data: Record<string, any>): T {
  const transformedData: Record<string, any> = {};
  for (const key in data) {
    transformedData[key] = Buffer.isBuffer(data[key]) ? data[key].toString('hex') : data[key];
  }
  return transformedData as T;
}

export async function generateSalesPrintHtml(id: string): Promise<string> {
  return 'html';
}
