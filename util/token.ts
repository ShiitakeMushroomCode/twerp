import { executeQuery } from '@/lib/db';
import { ACT } from 'auth';
import { jwtVerify, SignJWT } from 'jose';
import _ from 'lodash';
import { cookies } from 'next/headers';

// 구버전
// export async function StoreRefreshToken(userId: any, refreshToken: any) {
//   try {
//     await executeQuery('UPDATE employee SET ref_token = ? WHERE phone_number = ?;', [refreshToken, userId]);
//     return true;
//   } catch (error) {
//     console.log('토큰 저장에 오류남');
//     return false;
//   }
// }

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function StoreAndGetUserData(userId: any, refreshToken: any) {
  let user;
  try {
    // 한번에 필요한 데이터 조회
    user = await executeQuery('SELECT * FROM employee WHERE phone_number = ?', [userId]);
    if (user) {
      // 리프레시 토큰 업데이트
      await executeQuery('UPDATE employee SET ref_token = ? WHERE phone_number = ?', [refreshToken, userId]);
    }
    return user;
  } catch (error) {
    console.log('사용자 데이터 저장 또는 조회에 오류남');
    return null;
  }
}

export async function getAccessToken() {
  return cookies().get('accessToken');
}

export async function getTokenUserData() {
  return (await jwtVerify(cookies().get('accessToken').value, secret)).payload.data;
}

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
// export async function checkRefreshTokenInDB(userId: any, refreshToken: any) {
//   return await executeQuery('SELECT ref_token FROM employee WHERE phone_number=? AND ref_token=?;', [
//     userId,
//     refreshToken,
//   ]);
// }

export async function getInnerData(data) {
  const innerData: ACT = {
    companyId: await data?.company_id, // 회사 ID
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

// export async function removeRefreshTokenFromDB(refreshToken: any) {
//   const log = await executeQuery('UPDATE employee SET ref_token = NULL WHERE ref_token = ?;', refreshToken);
// }

export async function removeRefreshTokenFromDB(refreshToken: string) {
  if (!refreshToken) {
    console.error('리프레시 토큰이 유효하지 않음:', refreshToken);
    // throw new Error('유효하지 않은 리프레시 토큰입니다.');
    return false;
  }

  try {
    await executeQuery('UPDATE employee SET ref_token = NULL WHERE ref_token = ?', [refreshToken]);
  } catch (error) {
    console.error('리프레시 토큰 삭제 실패:', error.message);
    // throw error;
    return false;
  }
}

export async function generateCertificationToken({ userId, cn }) {
  return new SignJWT({ userId, cn })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);
}

// 전화번호 업데이트 함수
export async function updatePhoneNumber(userId: string, newPhoneNumber: string): Promise<boolean> {
  // 값 검증
  if (_.isEmpty(userId) || _.isEmpty(newPhoneNumber)) {
    console.error('유효하지 않은 userId 또는 newPhoneNumber 값입니다.');
    return false;
  }

  try {
    // 전화번호 업데이트
    await executeQuery('UPDATE employee SET phone_number = ? WHERE phone_number = ?;', [newPhoneNumber, userId]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 전화번호 업데이트 함수
export async function updateEmail(userId: string, newEmail: string): Promise<boolean> {
  // 값 검증
  if (_.isEmpty(userId) || _.isEmpty(newEmail)) {
    console.error('유효하지 않은 userId 또는 newPhoneNumber 값입니다.');
    return false;
  }

  try {
    // 전화번호 업데이트
    await executeQuery('UPDATE employee SET email = ? WHERE phone_number = ?;', [newEmail, userId]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 인증 토큰 저장 함수
export async function saveVerificationToken(userId: string, token: string): Promise<boolean> {
  // 값 검증
  if (_.isEmpty(userId) || _.isEmpty(token)) {
    console.error('유효하지 않은 userId 또는 token 값입니다.');
    return false;
  }

  try {
    // 데이터베이스에 토큰 저장
    await executeQuery('UPDATE employee SET cer_code = ? WHERE phone_number = ?;', [token, userId]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 인증 토큰 가져오기 함수
export async function getVerificationToken(userId: string): Promise<string | null> {
  // 값 검증
  if (_.isEmpty(userId)) {
    console.error('유효하지 않은 userId 값입니다.');
    return null;
  }

  try {
    // 데이터베이스에서 토큰 가져오기
    const result = await executeQuery('SELECT cer_code FROM employee WHERE phone_number = ?', [userId]);
    const token = result[0]?.cer_code || null;
    return token;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

// 인증 토큰 삭제 함수
export async function deleteVerificationToken(userId: string): Promise<boolean> {
  // 값 검증
  if (_.isEmpty(userId)) {
    console.error('유효하지 않은 userId 값입니다.');
    return false;
  }

  try {
    // 데이터베이스에서 토큰 삭제
    await executeQuery('UPDATE employee SET cer_code = NULL WHERE phone_number = ?', [userId]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}
