import PurchaseForm, { PurchaseFormData } from '@/components/(회계)/(구매)/(Form)/PurchaseForm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '매입 정보 입력',
};

async function onSubmit(formData: PurchaseFormData) {
  'use server';
  try {
    const res = await fetch(`${process.env.API_URL}/purchaseAdd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (res.ok) {
      revalidatePath('/purchase-list');
      const data = await res.json();
      return { status: 'success', message: '매입 기록이 성공적으로 생성되었습니다.', id: data['id'] };
    } else {
      return {
        status: 'error',
        message: '매입 기록 생성에 실패하였습니다.',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'API 요청 중 에러가 발생했습니다.',
    };
  }
}

export default async function Page() {
  return <PurchaseForm initialData={null} onSubmit={onSubmit} />;
}
