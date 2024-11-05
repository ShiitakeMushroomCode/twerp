import SalesForm, { SalesFormData } from '@/components/(회계)/(판매)/SalesForm';
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

async function getInitialData(id: string) {
  'use server';
  const data = (await getTokenUserData()) as ACT;
  // console.log(data);
  const salesIdBuffer = Buffer.from(id, 'hex');
  const [salesR, salesItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
  ]);
  const salesResult = salesR[0];
  return {
    company_id: data['companyId']['data'].toString() || '',
    sale_date: salesResult?.['sale_date'] ? new Date(salesResult['sale_date']).toISOString().split('T')[0] : '',
    transaction_type: salesResult?.['transaction_type'] || '카드결제',
    collection: salesResult?.['collection'] || '진행중',
    client_id: salesResult?.['client_id'] || null,
    client_name: salesResult?.['client_name'] || '',
    client_address: salesResult?.['client_address'] || '',
    client_tel: salesResult?.['client_tel'] || '',
    client_fax: salesResult?.['client_fax'] || '',
    description: salesResult?.['description'] || '',
    sales_items: salesItemsResult.map((item: any) => ({
      product_id: item.product_id || '',
      product_name: item.product_name || '',
      standard: item.standard || '',
      price: item.price?.toString() || '',
      quantity: item.quantity?.toString() || '',
      unit: item.unit || '',
      description: item.description || '',
      sub_price: item.sub_price?.toString() || '',
      selected: false,
    })),
  };
}

export default async function Page({ params: { id } }: PageProps) {
  return <SalesForm initialData={(await getInitialData(id)) as SalesFormData} onSubmit={''} isEditMode={true} />;
}
