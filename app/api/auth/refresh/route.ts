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
  const data = await request.json();
  const refreshToken = await data?.refreshToken?.value;
  // 리프레시 토큰 있어야함
  if (!refreshToken) {
    console.log('리프레시 토큰 없는듯');
    return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
  }

  const userId = await verifyRefreshToken(refreshToken);
  // userId도 정상이여야 함
  if (!userId) {
    console.log('userId가 안들어있나?');
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }

  // DB에서 리프레시 토큰 유효성 확인
  const isStored = await checkRefreshTokenInDB(userId.toString(), await refreshToken.toString());

  // DB에 있는 리프레시 토큰이여야 함
  if (!isStored) {
    console.log('DB에 없는 리프레시 토큰 인듯');
    return NextResponse.json({ error: 'Refresh token not found in DB' }, { status: 401 });
  }

  // 새로운 액세스 토큰 생성
  const newAccessToken = await generateAccessToken(userId, 'user');

  return NextResponse.json({ accessToken: newAccessToken });
}
