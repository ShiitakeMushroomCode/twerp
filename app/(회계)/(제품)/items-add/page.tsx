import ProductForm, { ProductFormData } from '@/components/(회계)/(제품)/ProductForm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '제품 추가하기',
};

async function addProduct(formData: ProductFormData): Promise<{ status: string; message: string }> {
  'use server';

  try {
    const res = await fetch(`${process.env.API_URL}/itemAdd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
      body: JSON.stringify(formData),
      credentials: 'include',
    });
    if (res.ok) {
      revalidatePath('/items-list');
      return { status: 'success', message: '제품이 성공적으로 등록되었습니다.' };
    } else {
      return { status: 'error', message: (await res.json()).message };
    }
  } catch (error) {
    return { status: 'error', message: 'API 요청 중 에러가 발생했습니다.' };
  }
}

export default function Page() {
  return <ProductForm onSubmit={addProduct} isEditMode={false} />;
}
