import { generateAccessToken, generateRefreshToken, StoreRefreshToken } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  console.log(id, password);

  // 사용자 인증 로직 (예: 비밀번호 비교)
  const isAuthenticated = true; // 예시

  if (isAuthenticated) {
    const accessToken = await generateAccessToken(id, 'user');
    const refreshToken = await generateRefreshToken(id);

    await StoreRefreshToken(id, refreshToken);

    const response = NextResponse.json({ accessToken });
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
