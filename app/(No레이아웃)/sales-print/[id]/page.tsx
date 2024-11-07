import SalesPrintForm, { SalesPrintFormData } from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';

export const metadata = {
  title: '거래명세표 출력',
};

interface PageProps {
  params: {
    id: string;
  };
}

async function fetchSalesData(id: string): Promise<SalesPrintFormData> {
  'use server';
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

export default async function Page({ params: { id } }: PageProps) {
  const salesFormData = await fetchSalesData(id);
  return <SalesPrintForm salesFormData={salesFormData} />;
}
