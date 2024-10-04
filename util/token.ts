import { executeQuery } from '@/lib/db';
import { SignJWT } from 'jose';

export async function StoreRefreshToken({ userId, refreshToken }) {
  const query = `
    UPDATE employee
    SET ref_token = ?
    WHERE user_id = unhex(?);
  `;
  const result = await executeQuery(query, [refreshToken, userId]);
  return result;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateAccessToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRATION) // Access token은 15분동안 지속
    .sign(secret);
}

export async function generateRefreshToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRATION) // Refresh token 30일동안 지속
    .sign(secret);
}
