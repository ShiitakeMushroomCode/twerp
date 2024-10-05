import { checkRefreshTokenInDB, generateAccessToken } from '@/util/token';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
async function verifyRefreshToken(refreshToken: string) {
  try {
    const { payload } = await jwtVerify(refreshToken, secret);
    return payload.userId.toString();
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
  }

  const userId = await verifyRefreshToken(refreshToken);

  if (!userId) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }

  // DB에서 리프레시 토큰 유효성 확인
  const isStored = await checkRefreshTokenInDB(userId, refreshToken);

  if (!isStored) {
    return NextResponse.json({ error: 'Refresh token not found in DB' }, { status: 401 });
  }

  // 새로운 액세스 토큰 생성
  const newAccessToken = await generateAccessToken(userId, 'user');

  return NextResponse.json({ accessToken: newAccessToken });
}
