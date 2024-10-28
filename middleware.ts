import { getCookieDomain } from '@/util/token';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_REDIRECT, PUBLIC_ROUTES } from './lib/routes';
export const runtime = 'nodejs';

<<<<<<< HEAD
const domain = getCookieDomain();
async function signout(refreshToken, res: NextResponse) {
  if (refreshToken) {
    try {
      await fetch(`${process.env.API_URL}/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshToken }), // 수정: refreshToken.value 전달
      });
    } catch (error) {
      console.error('서버에서 로그아웃 처리 중 오류 발생:', error);
    }
  }

  clearCookie('accessToken', res);
  clearCookie('refreshToken', res);
}

function clearCookie(name: string, response: NextResponse) {
  response.cookies.set(name, '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    sameSite: 'strict', // 'lax'에서 'strict'로 변경하여 일관성 유지
    secure: process.env.NODE_ENV === 'production', // 환경에 따라 설정
    domain: domain,
  });
}

async function logging(msg) {
  try {
    const logEndpoint = process.env.API_URL.endsWith('/api')
      ? `${process.env.API_URL}/log`
      : `${process.env.API_URL}/api/log`;

    const response = await fetch(logEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pathname: msg }),
    });

    if (!response.ok) {
      console.error('Logging failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error during logging:', error);
  }
}
=======
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
>>>>>>> 이게-맞나

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

<<<<<<< HEAD
  // console.log(`AccessToken: ${accessToken?.value}`);
  // console.log(`RefreshToken: ${refreshToken?.value}`);

  // 로그아웃을 위한 함수 통합
  async function handleSignout() {
    await logging('로그아웃을 위한 함수 통합');
    const response = NextResponse.redirect(new URL('/signin', request.url));
    await signout(refreshToken?.value, response); // 수정: refreshToken.value 전달
    return response;
  }
=======
  // console.log(
  //   `${request.url}: accessToken = ${accessToken ? true : false}, refreshToken = ${refreshToken ? true : false}`
  // );
>>>>>>> 이게-맞나

  // 로그인도 안하고 보호된 경로에 접근 시도
  if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname) && !accessToken) {
    await logging('로그인도 안하고 보호된 경로에 들어가는 시도 막기');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 로그인한 상태에서 로그인 또는 회원가입 페이지에 접근 시도
  if (PUBLIC_ROUTES.includes(request.nextUrl.pathname) && accessToken) {
    await logging('로그인 했으면서 또 로그인이나 회원가입 시도 막기');
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // 리프레시 토큰을 통한 액세스 토큰 갱신
  if (!accessToken && refreshToken) {
    await logging('리프레시 토큰을 통해 액세스 토큰 갱신 시도');

    if (!refreshToken.value) {
      await logging('유효하지 않은 리프레시 토큰');
      console.error('미들웨어에서 유효하지 않은 리프레시 토큰:', refreshToken.value);
      const response = NextResponse.redirect(new URL('/signin', request.url));
      return response; // 로그아웃 처리 없이 바로 리다이렉트
    }
<<<<<<< HEAD

    return handleSignout();
  }

  // 로그아웃 요청 처리
  if (request.nextUrl.pathname === '/signout') {
    await logging('로그아웃 요청 처리');
    return handleSignout();
=======
    console.log('갱신을 1시간 동안 안 하면 로그아웃한 걸로 간주');
    return NextResponse.redirect(new URL('/signout', request.url));
>>>>>>> 이게-맞나
  }

  // 액세스 토큰 검증
  if (accessToken) {
    await logging('액세스 토큰이 유효한 경우');
    try {
<<<<<<< HEAD
      await logging('accessToken 검증');
      const res = await fetch(`${process.env.API_URL}/auth/checkAccessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Cookie: cookies().toString(),
        },
      });
      if (res.ok) {
        return NextResponse.next();
      }
    } catch (refreshError) {
      return handleSignout();
=======
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
              sameSite: 'lax',
              secure: true,
            });
            return response;
          }
        } catch (refreshError) {
          console.error('리프레시 토큰으로 갱신 실패:', refreshError);
        }
      }
      // 리프레시 토큰도 만료되거나 오류 발생 시 로그아웃 처리
      console.log('리프레시 토큰도 만료되거나 오류 발생 시 로그아웃 처리');
      return NextResponse.redirect(new URL('/signout', request.url));
>>>>>>> 이게-맞나
    }
  }

  return NextResponse.next();
}

// 설정: `/api/auth`를 제외한 모든 경로에 미들웨어 적용
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
