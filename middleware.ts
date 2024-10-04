import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  const path = request.nextUrl.pathname;
  // console.log(accessToken);
  // console.log(path);
  // console.log(request.url);

  // 로그인도 안하고 엄한데 들어가는거 막기
  if (!PUBLIC_ROUTES.includes(path) && !accessToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 로그인 했으면서 또 하거나 회원가입 하는거 막기
  if (PUBLIC_ROUTES.includes(path) && accessToken) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // accessToken 검증
  if (accessToken) {
    try {
      await jwtVerify(accessToken, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }
}

// 설정: 특정 경로에만 미들웨어 적용
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|logo.ico).*)'],
};
