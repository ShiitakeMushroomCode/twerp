import PurchaseForm, { PurchaseFormData } from '@/components/(회계)/(구매)/(Form)/PurchaseForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '매입 정보 수정',
};

interface PageProps {
  params: {
    id: string;
  };
}

async function getInitialData(id: string) {
  'use server';
  const data = (await getTokenUserData()) as ACT;
  const purchaseIdBuffer = Buffer.from(id, 'hex');

  const [purchaseResult, purchaseItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM purchases WHERE purchase_id = ?', [purchaseIdBuffer]),
    executeQuery('SELECT * FROM purchase_items WHERE purchase_id = ?', [purchaseIdBuffer]),
  ]);

  const purchase = purchaseResult[0];

  return {
    purchase_id: purchaseIdBuffer.toString('hex'),
    company_id: data['companyId']['data'].toString() || '',
    purchase_date: purchase?.['purchase_date'],
    transaction_type: purchase?.['transaction_type'] || '카드결제',
    collection: purchase?.['collection'] || '진행중',
    supplier_id: purchase?.['supplier_id'] ? purchase['supplier_id'].toString('hex') : null,
    supplier_name: purchase?.['supplier_name'] || '',
    supplier_address: purchase?.['supplier_address'] || '',
    supplier_tel: purchase?.['supplier_tel'] || '',
    supplier_fax: purchase?.['supplier_fax'] || '',
    description: purchase?.['description'] || '',
    purchase_items: purchaseItemsResult.map((item: any) => ({
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

async function onSubmit(formData: PurchaseFormData) {
  'use server';
  try {
    const res = await fetch(`${process.env.API_URL}/purchaseUpdate`, {
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
      revalidatePath('/purchase-list');      
      const data = await res.json();
      return { status: 'success', message: '매입 기록이 성공적으로 저장되었습니다.', id: data['id']};
    } else {
      return {
        status: 'error',
        message: '매입 기록 저장에 실패하였습니다.',
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
  return  <PurchaseForm initialData={(await getInitialData(id)) as PurchaseFormData} onSubmit={onSubmit} isEditMode={true} />
}
