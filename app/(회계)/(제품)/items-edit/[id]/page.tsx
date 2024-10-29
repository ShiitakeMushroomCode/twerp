import ProductForm, { ProductFormData } from '@/components/(회계)/(제품)/ProductForm';
import { executeQuery } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '제품 수정하기',
};

// 동적 렌더링을 강제합니다.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

async function fetchProductData(id: string): Promise<ProductFormData> {
  'use server';
  if (!id) {
    throw new Error('product_id가 제공되지 않았습니다.');
  }

  // UUID 문자열에서 하이픈을 제거하고 Buffer로 변환
  const bufferId = Buffer.from(id.replace(/-/g, ''), 'hex');

  const result = await executeQuery('SELECT * FROM product WHERE product_id = ?', [bufferId]);
  const productData = result[0];
  if (!productData) {
    throw new Error('제품 데이터를 찾을 수 없습니다.');
  }

  const formattedData: ProductFormData = {
    product_id: id,
    product_name: productData.product_name,
    category: productData.category,
    price: productData.price,
    manufacturer: productData.manufacturer,
    start_date: productData.start_date ? productData.start_date.toISOString().split('T')[0] : '',
    is_use: productData.is_use,
    description: productData.description,
  };

  return formattedData;
}

async function updateProduct(formData: ProductFormData): Promise<{ status: string; message: string }> {
  'use server';
  try {
    const res = await fetch(`${process.env.API_URL}/itemUpdate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
      body: JSON.stringify(formData),
      credentials: 'include',
    });
    if (res.ok) {
      revalidatePath('/product-list');
      return { status: 'success', message: '제품이 성공적으로 수정되었습니다.' };
    } else {
      const errorData = await res.json();
      return { status: 'error', message: errorData.message || '제품 수정에 실패하였습니다.' };
    }
  } catch (error) {
    console.error('API 요청 중 에러 발생:', error);
    return { status: 'error', message: 'API 요청 중 에러가 발생했습니다.' };
  }
}

export default async function Page({ params: { id } }: PageProps) {
  try {
    const data = await fetchProductData(id);
    return <ProductForm initialData={data} onSubmit={updateProduct} isEditMode={true} />;
  } catch (error) {
    // 에러 페이지로 리다이렉트하거나 에러 메시지를 표시할 수 있습니다.
    return <div>오류: {(error as Error).message}</div>;
  }
}
