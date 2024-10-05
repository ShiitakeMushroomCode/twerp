import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';

// 비밀번호 해시 함수
export async function hashPassword(password: string) {
  try {
    const hash = await bcrypt.hash(password, parseInt(process.env.SALTROUNDS));
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

// 비밀번호 검증 함수
export async function verifyPassword(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error verifying password');
  }
}

export async function isAuthenticated(id: string, password: string) {
  return await bcrypt.compare(
    password,
    (
      await executeQuery('SELECT password FROM employee WHERE phone_number=?;', [id])
    )[0].password
  );
}
