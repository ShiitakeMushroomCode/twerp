import SalesForm, { SalesFormData } from '@/components/(회계)/(판매)/(Form)/SalesForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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
    sales_id: salesResult?.['sales_id'].toString('hex') || null,
    company_id: data['companyId']['data'].toString() || '',
    sale_date: salesResult?.['sale_date'] ? new Date(salesResult['sale_date']).toISOString().split('T')[0] : '',
    transaction_type: salesResult?.['transaction_type'] || '카드결제',
    collection: salesResult?.['collection'] || '진행중',
    client_id: salesResult?.['client_id'] ? salesResult?.['client_id'].toString('hex') : null,
    client_name: salesResult?.['client_name'] || '',
    client_address: salesResult?.['client_address'] || '',
    client_tel: salesResult?.['client_tel'] || '',
    client_fax: salesResult?.['client_fax'] || '',
    description: salesResult?.['description'] || '',
    sales_items: salesItemsResult.map((item: any) => ({
      product_id: item.product_id ? item.product_id.toString('hex') : null,
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

async function onSubmit(formData: SalesFormData) {
  'use server';
  try {
    const res = await fetch(`${process.env.API_URL}/salesUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (res.ok) {
      // 성공 시 페이지를 재검증하거나 성공 메시지를 표시할 수 있습니다.
      revalidatePath('/sales-list');      
      const data = await res.json();
      return { status: 'success', message: '매출 기록이 성공적으로 저장되었습니다.', id: data['id']};
    } else {
      return {
        status: 'error',
        message: '매출 기록 저장에 실패하였습니다.',
      };
    }
  } catch (error) {
    // console.error('API 요청 중 에러 발생:', error);
    return {
      status: 'error',
      message: 'API 요청 중 에러가 발생했습니다.',
    };
  }
}

export default async function Page({ params: { id } }: PageProps) {
  return <SalesForm initialData={(await getInitialData(id)) as SalesFormData} onSubmit={onSubmit} isEditMode={true} />;
}
