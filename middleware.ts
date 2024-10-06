import { ACT } from 'auth';
import { error } from 'console';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
async function signout(refreshToken, res) {
  clearCookie('accessToken', res);
  clearCookie('refreshToken', res);
  await fetch(`${process.env.API_URL}/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refreshToken: refreshToken }),
  });
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
    signout(refreshToken, response);
    return response;
  }

  // 로그아웃
  if (request.nextUrl.pathname === '/signout') {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    signout(refreshToken, response);
    return response;
  }

  // accessToken 검증 시간 보고
  if (accessToken) {
    try {
      const [accessPayload, refreshPayload] = await Promise.all([
        (await jwtVerify(accessToken.value, secret)).payload,
        (await jwtVerify(refreshToken.value, secret)).payload,
      ]);
      const accessPayloadData = accessPayload.data as ACT;

      if (accessPayloadData.userId !== refreshPayload.userId) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      if (accessPayload.exp <= Math.floor(Date.now() / 1000)) {
        // 여기서 POST요청 API로 보내면 거기서 처리해야할 듯
        const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken: refreshToken }),
        });

        if (res.ok) {
          const newAccessToken = (await res.json()).accessToken;
          const response = NextResponse.next();
          clearCookie('accessToken', response);
          response.cookies.set('accessToken', await newAccessToken, {
            maxAge: 30 * 60, // 30분
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
          });
          return response;
        } else {
          throw new error('이건 망했어!');
        }
      }
      return NextResponse.next();
    } catch (error) {
      // 토큰 검증 실패 시 처리
      console.error('토큰 검증 실패함:', error);
      const response = NextResponse.redirect(new URL('/signin', request.url));
      signout(refreshToken, response);
      return response;
    }
  }
  return NextResponse.next();
}

// 설정: 특정 경로에만 미들웨어 적용
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};