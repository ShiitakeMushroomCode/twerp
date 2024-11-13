'use server';
import { executeQuery } from '@/lib/db';
import { isEmpty } from '@/util/lo';
import { hashPassword } from '@/util/password';
import { ACT } from 'auth';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function StoreAndGetUserData(refreshToken: any) {
  let user;

  try {
    const r = await verifyRefreshToken(refreshToken);
    const employeeId = Buffer.from(r['employee_id'] as string, 'hex');
    // 한번에 필요한 데이터 조회
    user = await executeQuery('SELECT * FROM employee WHERE employee_id = ?', [employeeId]);
    if (user) {
      user[0] = {
        ...user[0],
        hire_date: new Date(user[0].hire_date.getTime() + 32400000),
      };
      // 리프레시 토큰 업데이트
      await executeQuery('UPDATE employee SET ref_token = ? WHERE employee_id = ?', [refreshToken, employeeId]);
    }
    return user;
  } catch (error) {
    // console.log('사용자 데이터 저장 또는 조회에 오류남');
    return null;
  }
}

export async function getAccessToken() {
  return cookies().get('accessToken');
}

export async function getTokenUserData() {
  if (cookies().has('accessToken')) {
    return (await jwtVerify(cookies().get('accessToken').value, secret)).payload.data;
  } else if (cookies().has('refreshToken')) {
    const refreshToken = cookies().get('refreshToken');
    await jwtVerify(refreshToken.value, secret);
    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const newAccessToken = (await res.json()).accessToken;
      // 새 액세스 토큰 설정
      cookies().set('accessToken', newAccessToken, {
        maxAge: 60 * 15, // 15분
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        domain: process.env.DOMAIN_URL || 'werp.p-e.kr',
      });
      return (await jwtVerify(cookies().get('accessToken').value, secret)).payload.data;
    } else {
      redirect(`${process.env.SITE_URL}/signout`);
    }
  }
}

export async function generateAccessToken(data: ACT) {
  return new SignJWT({ data: await getInnerData(data[0]) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRATION) // Access token은 15분동안 지속 process.env.JWT_EXPIRATION
    .sign(secret);
}

export async function generateRefreshToken(userId: any) {
  return new SignJWT({ employee_id: await employeeId(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRATION) // Refresh token 30일동안 지속
    .sign(secret);
}

export async function employeeId(userId) {
  return (
    await executeQuery('SELECT employee_id FROM employee WHERE phone_number = ?', [userId])
  )[0].employee_id.toString('hex');
}

export async function getInnerData(data) {
  const innerData: ACT = {
    employee_id: await data?.employee_id, // 사원 ID
    companyId: await data?.company_id, // 회사 ID
    userId: await data?.phone_number, // 휴대전화 번호
    department: await data?.department, // 부서명
    name: await data?.name, // 이름
    tellNumber: await data?.tellNumber, // 전화번호
    position: await data?.position, // 직급
    email: await data?.email, // 이메일
    hireDate: (await data?.hire_date) ? new Date(await data.hire_date).toISOString().split('T')[0] : null, // 입사일
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
    console.log('리프레시 토큰 db에서 삭제 성공');
    return true;
  } catch (error) {
    console.error('리프레시 토큰 삭제 실패:', error.message);
    // throw error;
    return false;
  }
}

export async function generateCertificationToken({ employee_id, cn }) {
  return new SignJWT({ employee_id: Buffer.from(employee_id, 'hex'), cn })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);
}

// 전화번호 업데이트 함수
export async function updatePhoneNumber(newPhoneNumber: string): Promise<boolean> {
  // 값 검증
  if (isEmpty(newPhoneNumber)) {
    console.error('유효하지 않은 newPhoneNumber 값입니다.');
    return false;
  }

  try {
    // 전화번호 업데이트
    await executeQuery('UPDATE employee SET phone_number = ? WHERE employee_id = ?;', [
      newPhoneNumber,
      await getEmployeeId(),
    ]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 이메일 업데이트 함수
export async function updateEmail(newEmail: string): Promise<boolean> {
  // 값 검증
  if (isEmpty(newEmail)) {
    console.error('유효하지 않은 newPhoneNumber 값입니다.');
    return false;
  }

  try {
    // 이메일 업데이트
    await executeQuery('UPDATE employee SET email = ? WHERE employee_id = ?;', [newEmail, await getEmployeeId()]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 비밀번호 업데이트 함수
export async function updatePassword(newPassword: string): Promise<boolean> {
  // 값 검증
  if (isEmpty(newPassword)) {
    console.error('유효하지 않은 newPassword 값입니다.');
    return false;
  }

  try {
    // 전화번호 업데이트
    await executeQuery('UPDATE employee SET password = ? WHERE employee_id = ?;', [
      await hashPassword(newPassword),
      await getEmployeeId(),
    ]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 인증 토큰 저장 함수
export async function saveVerificationToken(employee_id, token: string): Promise<boolean> {
  // 값 검증
  if (isEmpty(token)) {
    console.error('유효하지 않은 token 값입니다.');
    return false;
  }

  try {
    // 데이터베이스에 토큰 저장
    await executeQuery('UPDATE employee SET cer_code = ? WHERE employee_id = ?;', [
      token,
      Buffer.from(employee_id, 'hex'),
    ]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

// 인증 토큰 가져오기 함수
export async function getVerificationToken(): Promise<string | null> {
  try {
    // 데이터베이스에서 토큰 가져오기
    const result = await executeQuery('SELECT cer_code FROM employee WHERE employee_id = ?', [await getEmployeeId()]);
    const token = result[0]?.cer_code || null;
    return token;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

// 인증 토큰 삭제 함수
export async function deleteVerificationToken(): Promise<boolean> {
  try {
    // 데이터베이스에서 토큰 삭제
    await executeQuery('UPDATE employee SET cer_code = NULL WHERE employee_id = ?', [await getEmployeeId()]);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

export async function getEmployeeId() {
  const data = await verifyRefreshToken(cookies().get('refreshToken').value);
  return Buffer.from(data?.employee_id.toString(), 'hex');
}

interface CustomJWTPayload extends JWTPayload {
  employee_id?: string;
}

export async function verifyRefreshToken(refreshToken: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(refreshToken, secret);
    return payload as CustomJWTPayload;
  } catch (e) {
    return null;
  }
}
