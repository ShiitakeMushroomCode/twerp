import { verifyRefreshToken } from 'app/api/auth/refresh/route';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
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
  if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname) && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 로그인 했으면서 또 하거나 회원가입 하는 거 막기
  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname) && accessToken && refreshToken) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  if (accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/signout', request.url));
  }

  // 로그아웃 안하면 자동로그인
  if (!accessToken && refreshToken) {
    try {
      await jwtVerify(refreshToken.value, secret);
      const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Cookie: cookies().toString(),
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const newAccessToken = (await res.json()).accessToken;
        const response = NextResponse.next();

        // 새 액세스 토큰 설정
        response.cookies.set('accessToken', newAccessToken, {
          maxAge: 60 * 15, // 15분
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        });
        return response;
      } else {
        return NextResponse.redirect(new URL('/signout', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/signout', request.url));
    }
  }
  // 액세스 토큰이 유효한 경우
  if (accessToken) {
    try {
      await jwtVerify(accessToken.value, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/signout', request.url));
    }
  }

  return NextResponse.next();
}

// 설정을 제외한 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|signout).*)'],
};
