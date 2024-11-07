import SalesForm, { SalesFormData } from '@/components/(회계)/(판매)/(Form)/SalesForm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '매출 입력',
};

async function onSubmit(formData: SalesFormData) {
  'use server';
  try {
    const res = await fetch(`${process.env.API_URL}/salesAdd`, {
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
      return { status: 'success', message: '매출 기록이 성공적으로 생성되었습니다.' };
    } else {
      return {
        status: 'error',
        message: '매출 기록 생성에 실패하였습니다.',
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

export default async function Page() {
  return <SalesForm initialData={null} onSubmit={onSubmit} />;
}
