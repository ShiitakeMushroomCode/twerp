import bcrypt from 'bcrypt';

const saltRounds = 12; // salt rounds 설정

// 비밀번호 해시 함수
export async function hashPassword(password: string) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

// 비밀번호 검증 함수
export async function verifyPassword(password: string, hash: string) {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    throw new Error('Error verifying password');
  }
}
