import SalesPrintForm, { SalesFormData } from '@/components/(회계)/(판매)/(인쇄내용물)/SalesPrintForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';

export const metadata = {
  title: '매출 정보 수정',
};

interface PageProps {
  params: {
    id: string;
  };
}

async function fetchSalesData(id: string): Promise<SalesFormData> {
  'use server';
  const data = (await getTokenUserData()) as ACT;
  const companyIdBuffer = Buffer.from(data.companyId['data'], 'hex');
  const salesIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, salesResult, salesItemsResult, sequence_number] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery(
      'SELECT s.sales_id, ROW_NUMBER() OVER (ORDER BY s.update_at DESC) AS sequence_number FROM sales s JOIN (SELECT sale_date FROM sales WHERE sales_id = ?) tsd ON s.sale_date = tsd.sale_date ORDER BY s.update_at DESC',
      [salesIdBuffer]
    ),
  ]);
  return {
    companyResult: companyResult[0],
    salesResult: salesResult[0],
    salesItemsResult,
    sequence_number: sequence_number.filter((item) => salesIdBuffer.equals(item['sales_id']))[0]['sequence_number'],
  };
}

export default async function Page({ params: { id } }: PageProps) {
  const salesFormData = await fetchSalesData(id);
  return <SalesPrintForm salesFormData={salesFormData} />;
}
