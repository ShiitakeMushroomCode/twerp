import { isAuthenticated } from '@/util/password';
import { generateAccessToken, generateRefreshToken, getInnerData, StoreAndGetUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';
export function getCookieDomain() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DOMAIN_URL;
  }
  return undefined; // 개발 환경에서는 도메인 설정 생략
}

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  const domain = getCookieDomain();
  // 사용자 인증 로직 (예: 비밀번호 비교)
  if (await isAuthenticated(id, password)) {
    const refreshToken = await generateRefreshToken(id);

    const data = (await StoreAndGetUserData(id, refreshToken))[0];

    const innerData: ACT = await getInnerData(data);

    const accessToken = await generateAccessToken(innerData);

    // 응답 객체 생성
    const response = NextResponse.json({
      message: '로그인 성공적',
    });

    // 액세스 토큰 쿠키 설정
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60, // 1시간
      path: '/',
      sameSite: 'strict',
      secure: true,
      domain: domain,
    });

    // 리프레시 토큰 쿠키 설정
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/',
      sameSite: 'strict',
      secure: true,
      domain: domain,
    });

    return response;
  } else {
    return NextResponse.json({ error: '로그인 실패' }, { status: 401 });
  }
}
