import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export function getCookieDomain() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DOMAIN_URL;
  }
  return undefined; // 개발 환경에서는 도메인 설정 생략
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export async function POST(request: NextRequest) {
  const accessTokenValue = cookies().get('accessToken').value;
  try {
    await jwtVerify(accessTokenValue, secret);
    return NextResponse.json({ msg: '로그인 성공' }, { status: 200 });
  } catch (e) {
    const refreshTokenValue = cookies().get('refreshToken').value;
    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    if (res.ok) {
      const domain = getCookieDomain();
      const newAccessToken = (await res.json()).accessToken;
      cookies().set({
        name: 'accessToken',
        value: newAccessToken,
        httpOnly: true,
        maxAge: 60 * 60, // 1시간
        path: '/',
        sameSite: 'strict',
        secure: true,
        domain: domain,
      });
      return NextResponse.json({ msg: '리로딩 성공' }, { status: 200 });
    }
    return NextResponse.json({ error: '로그인 실패' }, { status: 401 });
  }
}

// try {
//   // 액세스 토큰이 유효한 경우
//   await logging('액세스 토큰이 유효한 경우');
//   await jwtVerify(accessToken.value, secret);
//   return NextResponse.next();
// } catch (error) {
//   // 액세스 토큰이 만료된 경우 리프레시 토큰을 통해 갱신 시도
//   await logging('액세스 토큰이 만료된 경우 리프레시 토큰을 통해 갱신 시도');
//   if (refreshToken) {
//     try {
//       const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify({ refreshToken: refreshToken }),
//       });

//       if (res.ok) {
//         const newAccessToken = (await res.json()).accessToken;
//         const response = NextResponse.next();
//         response.cookies.set('accessToken', newAccessToken, {
//           maxAge: 60 * 60, // 1시간
//           path: '/',
//           httpOnly: true,
//           sameSite: 'strict', // 일관성 유지
//           secure: process.env.NODE_ENV === 'production', // 환경에 따라 설정
//           domain: domain,
//         });
//         await logging('액세스 토큰 갱신 완료');
//         return response;
//       }
//     } catch (refreshError) {
//       console.error('리프레시 토큰으로 갱신 중 오류 발생:', refreshError);
//       return handleSignout();
//     }
//   }
//   // 리프레시 토큰도 없거나 오류 발생 시 로그아웃 처리
//   return handleSignout();
// }
