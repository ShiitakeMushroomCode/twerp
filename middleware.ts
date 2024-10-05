import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
  return response.json();
}

function clearCookie(name: string, response: NextResponse) {
  response.cookies.set(name, '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  });
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // 로그인도 안하고 엄한데 들어가는거 막기
  if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname) && !accessToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  // 로그인 했으면서 또 하거나 회원가입 하는거 막기
  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname) && accessToken) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // 갱신을 30분동안 안하면 로그아웃한걸로
  if (!accessToken && refreshToken) {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    clearCookie('refreshToken', response);
    return response;
  }

  // 로그아웃
  if (request.nextUrl.pathname === '/signout') {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    clearCookie('accessToken', response);
    clearCookie('refreshToken', response);
    return response;
  }

  // accessToken 검증 시간 보고
  if (accessToken) {
    try {
      const [accessPayload, refreshPayload] = await Promise.all([
        (await jwtVerify(accessToken.value, secret)).payload,
        (await jwtVerify(refreshToken.value, secret)).payload,
      ]);

      if (accessPayload.userId !== refreshPayload.userId) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
      if (accessPayload.exp <= Math.floor(Date.now() / 1000)) {
        const userId = accessPayload.userId.toString();
        const role = 'user';
        // 함수 있는데 작동 안함 진짜모름
        const newAccessToken = new SignJWT({ userId, role })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(process.env.JWT_EXPIRATION) // Access token은 15분동안 지속
          .sign(secret);

        const response = NextResponse.next();
        response.cookies.set('accessToken', await newAccessToken, {
          maxAge: 30 * 60, // 30분
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        });
        return response;
      }
      return NextResponse.next();
    } catch (error) {
      // 토큰 검증 실패 시 처리
      console.error('Token validation error:', error);
      const response = NextResponse.redirect(new URL('/signin', request.url));
      clearCookie('accessToken', response);
      return response;
    }
  }
  return NextResponse.next();
}

// 설정: 특정 경로에만 미들웨어 적용
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
