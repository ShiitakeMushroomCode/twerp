import { executeQuery } from '@/lib/db';
import { generateAccessToken, getInnerData } from '@/util/token';
import { ACT } from 'auth';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
async function verifyRefreshToken(refreshToken: string) {
  try {
    const { payload } = await jwtVerify(refreshToken, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const d = await request.json();
  const refreshToken = await d?.refreshToken?.value;
  // 리프레시 토큰 있어야함
  if (!refreshToken) {
    return NextResponse.json({ error: '리프레시 토큰 없는듯' }, { status: 401 });
  }

  const refPayload = await verifyRefreshToken(refreshToken);

  // userId도 정상이여야 함
  if (!refPayload?.userId) {
    return NextResponse.json({ error: 'userId가 안들어있나?' }, { status: 401 });
  }

  const data = (await executeQuery('SELECT * FROM employee WHERE phone_number=?;', [refPayload?.userId.toString()]))[0];
  // DB에서 리프레시 토큰 유효성 확인
  // const isStored = await checkRefreshTokenInDB(refPayload?.userId.toString(), await refreshToken.toString());

  // DB에 있는 리프레시 토큰이여야 함
  if (!data?.ref_token) {
    return NextResponse.json({ error: 'DB에 없는 리프레시 토큰 인듯' }, { status: 401 });
  }

  const innerData: ACT = await getInnerData(data);

  // 새로운 액세스 토큰 생성
  const newAccessToken = await generateAccessToken(innerData);

  return NextResponse.json({ accessToken: newAccessToken });
}
