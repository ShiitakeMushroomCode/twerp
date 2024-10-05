import { isAuthenticated } from '@/util/password';
import { generateAccessToken, generateRefreshToken, StoreRefreshToken } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  // console.log(id, password);

  // 사용자 인증 로직 (예: 비밀번호 비교)
  if (await isAuthenticated(id, password)) {
    const accessToken = await generateAccessToken(id, 'user');
    const refreshToken = await generateRefreshToken(id);

    await StoreRefreshToken(id, refreshToken);

    const response = NextResponse.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: '로그인 성공적',
    });

    return response;
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
