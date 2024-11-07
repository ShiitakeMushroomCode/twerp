import { executeQuery } from '@/lib/db';
import { generateAccessToken, verifyRefreshToken } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const d = await request.json();
  const refreshToken = await d?.refreshToken?.value;
  // 리프레시 토큰 있어야함
  if (!refreshToken) {
    return NextResponse.json({ error: '리프레시 토큰 없는듯' }, { status: 401 });
  }

  const refPayload = await verifyRefreshToken(refreshToken);
  // userId도 정상이여야 함
  if (!refPayload?.employee_id) {
    return NextResponse.json({ error: 'employee_id 안들어있나?' }, { status: 401 });
  }

  const employeeId = Buffer.from(refPayload['employee_id'] as string, 'hex');

  const data = await executeQuery('SELECT * FROM employee WHERE employee_id = ?;', [employeeId]);
  // DB에서 리프레시 토큰 유효성 확인
  // const isStored = await checkRefreshTokenInDB(refPayload?.userId.toString(), await refreshToken.toString());

  // DB에 있는 리프레시 토큰이여야 함
  if (!data[0]?.ref_token) {
    return NextResponse.json({ error: 'DB에 없는 리프레시 토큰 인듯' }, { status: 401 });
  }

  // 새로운 액세스 토큰 생성
  const newAccessToken = await generateAccessToken(data);

  return NextResponse.json({ accessToken: newAccessToken });
}
