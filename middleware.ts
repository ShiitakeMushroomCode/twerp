import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // console.log(
  //   `${request.url}: accessToken = ${accessToken ? true : false}, refreshToken = ${refreshToken ? true : false}`
  // );

  // 로그인도 안하고 엄한데 들어가는 거 막기
  if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname) && !accessToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 로그인 했으면서 또 하거나 회원가입 하는 거 막기
  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname) && accessToken) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // 갱신을 1시간 동안 안 하면 로그아웃한 걸로 간주
  if (!accessToken && refreshToken) {
    if (!refreshToken.value) {
      console.error('미들웨어에서 유효하지 않은 리프레시 토큰:', refreshToken.value);
      const response = NextResponse.redirect(new URL('/signin', request.url));
      return response; // 로그아웃 처리 없이 바로 리다이렉트
    }
    console.log('갱신을 1시간 동안 안 하면 로그아웃한 걸로 간주');
    return NextResponse.redirect(new URL('/signout', request.url));
  }

  // accessToken 검증
  if (accessToken) {
    try {
      // 액세스 토큰이 유효한 경우
      await jwtVerify(accessToken.value, secret);
      return NextResponse.next();
    } catch (error) {
      console.log('액세스 토큰 만료 또는 검증 실패:', error);

      // 액세스 토큰이 만료된 경우 리프레시 토큰을 통해 갱신 시도
      if (refreshToken) {
        try {
          const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (res.ok) {
            const newAccessToken = (await res.json()).accessToken;
            const response = NextResponse.next();

            // 새 액세스 토큰 설정
            response.cookies.set('accessToken', newAccessToken, {
              maxAge: 60 * 60, // 1시간
              path: '/',
              httpOnly: true,
              sameSite: 'strict',
              secure: true,
            });
            return response;
          }
        } catch (refreshError) {
          console.error('리프레시 토큰으로 갱신 실패:', refreshError);
        }
      }
      // 리프레시 토큰도 만료되거나 오류 발생 시 로그아웃 처리
      console.log('리프레시 토큰 만료 또는 오류 발생');
      return NextResponse.redirect(new URL('/signout', request.url));
    }
  }

  return NextResponse.next();
}

// 설정: `/api/auth`를 제외한 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
