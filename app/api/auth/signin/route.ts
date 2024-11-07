import { isAuthenticated } from '@/util/password';
import { generateAccessToken, generateRefreshToken, StoreAndGetUserData } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  // console.log(id, password);

  // 사용자 인증 로직 (예: 비밀번호 비교)
  if (await isAuthenticated(id, password)) {
    const refreshToken = await generateRefreshToken(id);
    const data = await StoreAndGetUserData(refreshToken);
    const accessToken = await generateAccessToken(data);

    const response = NextResponse.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: '성공적으로 로그인되었습니다..',
    });

    return response;
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
