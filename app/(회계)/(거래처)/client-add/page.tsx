import ClientAdd from '@/components/(회계)/(거래처)/ClientAdd';

export const metadata = {
  title: '거래처 추가하기',
};
async function AddClient(formData: FormData) {
  'use server';
  // 값 필터링 필요함
  const [b_no, start_dt, p_nm] = [
    formData.get('business_number'),
    formData.get('start_date'),
    formData.get('representative_name'),
  ];
  const businesses = {
    businesses: [
      {
        b_no: b_no, // 사업자등록번호
        start_dt: start_dt, // 개업일자
        p_nm: p_nm, // 대표자성명
      },
    ],
  };
  console.log(businesses);

  // 제대로된 사업자인지 확인
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
      const errorData = await response.json();
      console.error('API 에러:', errorData);
      throw new Error(`HTTP 에러: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const validValue = jsonResponse.data[0].valid;
    console.log(validValue === '01' ? true : false);
  } catch (error) {
    console.error('에러:', error);
  }
}
export default async function Page() {
  return (
    <div>
      <ClientAdd AddClient={AddClient} />
    </div>
  );
}
