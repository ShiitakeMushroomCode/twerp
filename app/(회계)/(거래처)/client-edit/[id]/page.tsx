import ClientForm, { ClientFormData } from '@/components/(회계)/(거래처)/ClientForm';
import { executeQuery } from '@/lib/db';
import { Client } from 'auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const metadata = {
  title: '거래처 수정하기',
};

interface PageProps {
  params: {
    id: string;
  };
}

async function fetchClientData(id: string): Promise<ClientFormData> {
  'use server';
  const result = await executeQuery('SELECT * FROM clients WHERE clients_id = ?', [Buffer.from(id, 'hex')]);
  const clientData = result[0] as Client;
  const formattedData: ClientFormData = {
    business_number: clientData.business_number,
    company_name: clientData.company_name,
    representative_name: clientData.representative_name,
    start_date: clientData.start_date.toString(),
    business_status: clientData.business_status,
    main_item_name: clientData.main_item_name,
    business_address: clientData.business_address,
    tell_number: clientData.tell_number,
    fax_number: clientData.fax_number,
    billing_email: clientData.billing_email,
    description: clientData.description,
  };

  return formattedData;
}

async function updateClient(formData: ClientFormData): Promise<{ status: string; message: string }> {
  'use server';
  const businesses = {
    businesses: [
      {
        b_no: formData.business_number,
        start_dt: formData.start_date,
        p_nm: formData.representative_name,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.BUSINESS_INFO_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(businesses),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP 에러: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const validValue = jsonResponse.data[0].valid;

    if (validValue === '01') {
      const res = await fetch(`${process.env.API_URL}/clientUpdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      if (res.ok) {
        revalidatePath('/client-list');
        return { status: 'success', message: '거래처가 성공적으로 수정되었습니다.' };
      } else {
        return { status: 'error', message: (await res.json()).message };
      }
    } else {
      return { status: 'error', message: '등록되지 않은 사업자입니다. <br/>입력 정보 확인이 필요합니다.' };
    }
  } catch (error) {
    return { status: 'error', message: 'API 요청 중 에러가 발생했습니다.' };
  }
}

export default async function Page({ params: { id } }: PageProps) {
  const data = await fetchClientData(id);

  return <ClientForm initialData={data} onSubmit={updateClient} isEditMode={true} />;
}
