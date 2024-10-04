import { executeQuery } from '@/lib/db';
import { SignJWT } from 'jose';

export async function StoreRefreshToken(userId: any, refreshToken: any) {
  try {
    return await executeQuery('UPDATE employee SET ref_token = ? WHERE phone_number = ?;', [refreshToken, userId]);
  } catch (error) {
    console.log('여긴듯');
    return false;
  }
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateAccessToken(userId: any, role: any) {
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

export async function removeRefreshTokenFromDB(refreshToken: any) {}
