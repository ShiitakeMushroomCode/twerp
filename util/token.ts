import { executeQuery } from '@/lib/db';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function StoreRefreshToken(userId: any, refreshToken: any) {
  try {
    const log = await executeQuery('UPDATE employee SET ref_token = ? WHERE phone_number = ?;', [refreshToken, userId]);
    // console.log(log);
    return true;
  } catch (error) {
    console.log('토큰 저장에 오류남');
    return false;
  }
}

export async function getAccessToken() {
  return cookies().get('accessToken');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateAccessToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRATION) // Access token은 15분동안 지속
    .sign(secret);
}

export async function generateRefreshToken(userId: any) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRATION) // Refresh token 30일동안 지속
    .sign(secret);
}

export async function checkRefreshTokenInDB(userId: any, refreshToken: any) {
  return true;
}

export async function removeRefreshTokenFromDB(refreshToken: any) {
  const log = await executeQuery('UPDATE employee SET ref_token = ? WHERE ref_token = ?;', [null, refreshToken]);
}
