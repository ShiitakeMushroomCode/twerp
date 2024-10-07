import { executeQuery } from '@/lib/db';
import { ACT } from 'auth';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function StoreRefreshToken(userId: any, refreshToken: any) {
  try {
    await executeQuery('UPDATE employee SET ref_token = ? WHERE phone_number = ?;', [refreshToken, userId]);
    return true;
  } catch (error) {
    console.log('토큰 저장에 오류남');
    return false;
  }
}

export async function getAccessToken() {
  return cookies().get('accessToken');
}

export async function getTokenUserData() {
  return (await jwtVerify(cookies().get('accessToken').value, secret)).payload.data;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateAccessToken(data: ACT) {
  return new SignJWT({ data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRATION) // Access token은 15분동안 지속 process.env.JWT_EXPIRATION
    .sign(secret);
}

export async function generateRefreshToken(userId: any) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRATION) // Refresh token 30일동안 지속
    .sign(secret);
}

//안씀
export async function checkRefreshTokenInDB(userId: any, refreshToken: any) {
  return await executeQuery('SELECT ref_token FROM employee WHERE phone_number=? AND ref_token=?;', [
    userId,
    refreshToken,
  ]);
}

export async function getInnerData(data) {
  const innerData: ACT = {
    userId: await data?.phone_number, // 휴대전화 번호
    department: await data?.department, // 부서명
    name: await data?.name, // 이름
    tellNumber: await data?.tellNumber, // 전화번호
    position: await data?.position, // 직급
    email: await data?.email, // 이메일
    hireDate: await data?.hire_date.toISOString().split('T')[0], // 입사일
    status: await data?.status, // 현상태
  };
  return innerData;
}

export async function removeRefreshTokenFromDB(refreshToken: any) {
  const log = await executeQuery('UPDATE employee SET ref_token = ? WHERE ref_token = ?;', [null, refreshToken]);
}
