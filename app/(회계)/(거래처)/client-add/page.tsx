import ClientAdd from '@/components/(회계)/(거래처)/ClientAdd';
import { cookies } from 'next/headers';

export const metadata = {
  title: '거래처 추가하기',
};

// 서버 액션 함수
async function AddClient(formData: FormData) {
  'use server';
  const businesses = {
    businesses: [
      {
        b_no: formData['business_number'],
        start_dt: formData['start_date'],
        p_nm: formData['representative_name'],
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

    // 서버에서 결과 반환
    if (validValue === '01') {
      const res = await fetch(`${process.env.API_URL}/clientadd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
        body: JSON.stringify(formData),
        credentials: 'same-origin',
      });
      if (res.ok) {
        return { status: 'success', message: '클라이언트가 성공적으로 등록되었습니다.' };
      } else {
        return { status: 'error', message: (await res.json()).message };
      }
    } else {
      return { status: 'error', message: '등록되지 않은 사업자입니다. \n\n입력 정보 확인이 필요합니다.' };
    }
  } catch (error) {
    return { status: 'error', message: 'API 요청 중 에러가 발생했습니다.' };
  }
}

export default function Page() {
  return (
    <div>
      <ClientAdd AddClient={AddClient} />
    </div>
  );
}

// import ClientAdd from '@/components/(회계)/(거래처)/ClientAdd';
// import { cookies } from 'next/headers';

// export const metadata = {
//   title: '거래처 추가하기',
// };
// async function AddClient(formData: FormData) {
//   'use server';
//   // 값 필터링 필요함
//   const businesses = {
//     businesses: [
//       {
//         b_no: formData['business_number'], // 사업자등록번호
//         start_dt: formData['start_date'], // 개업일자
//         p_nm: formData['representative_name'], // 대표자성명
//       },
//     ],
//   };

//   // 제대로된 사업자인지 확인
//   try {
//     const response = await fetch(
//       `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.BUSINESS_INFO_API_KEY}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify(businesses),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('API 에러:', errorData);
//       throw new Error(`HTTP 에러: ${response.status}`);
//     }

//     const jsonResponse = await response.json();
//     const validValue = jsonResponse.data[0].valid;
//     if (validValue === '01') {
//       try {
//         const res = await fetch(`${process.env.API_URL}/clientadd`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', Cookie: cookies().toString() },
//           body: JSON.stringify(formData),
//           credentials: 'same-origin',
//         });
//         if (res.ok) {
//           console.log('클라이언트 생성 성공');
//         }
//       } catch (error) {
//         console.error('에러:', error);
//       }
//     }
//   } catch (error) {
//     console.error('에러:', error);
//   }
// }
// export default async function Page() {
//   return (
//     <div>
//       <ClientAdd AddClient={AddClient} />
//     </div>
//   );
// }
