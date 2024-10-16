import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function signout(refreshToken, res: NextResponse) {
  if (!refreshToken) {
    console.warn('로그아웃 시 리프레시 토큰이 유효하지 않음:', refreshToken);
    return; // 유효하지 않다면 아무 작업도 하지 않음
  }

  clearCookie('accessToken', res);
  clearCookie('refreshToken', res);

  try {
    await fetch(`${process.env.API_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });
  } catch (error) {
    console.error('서버에서 로그아웃 처리 중 오류 발생:', error);
  }
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

  // 로그아웃을 위한 함수 통합
  async function handleSignout() {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    await signout(refreshToken, response);
    return response;
  }

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

    const response = NextResponse.redirect(new URL('/signin', request.url));
    await signout(refreshToken.value, response);
    return response;
  }

  // 로그아웃 요청 처리
  if (request.nextUrl.pathname === '/signout') {
    return handleSignout();
  }

  // accessToken 검증
  if (accessToken) {
    try {
      // 액세스 토큰이 유효한 경우
      await jwtVerify(accessToken.value, secret);
      return NextResponse.next();
    } catch (error) {
      // 액세스 토큰이 만료된 경우 리프레시 토큰을 통해 갱신 시도
      if (refreshToken) {
        try {
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
      return handleSignout();
    }
  }

  return NextResponse.next();
}

// 설정: `/api/auth`를 제외한 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
