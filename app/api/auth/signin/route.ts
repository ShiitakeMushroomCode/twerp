import { isAuthenticated } from '@/util/password';
import { generateAccessToken, generateRefreshToken, getInnerData, StoreAndGetUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  // console.log(id, password);

  // 사용자 인증 로직 (예: 비밀번호 비교)
  if (await isAuthenticated(id, password)) {
    const refreshToken = await generateRefreshToken(id);

    const data = (await StoreAndGetUserData(id, refreshToken))[0];

    const innerData: ACT = await getInnerData(data);
    // {
    //   userId: await data?.phone_number, // 휴대전화 번호
    //   department: await data?.department, // 부서명
    //   name: await data?.name, // 이름
    //   tellNumber: await data?.tellNumber, // 전화번호
    //   position: await data?.position, // 직급
    //   email: await data?.email, // 이메일
    //   hireDate: await data?.hire_date.toISOString().split('T')[0], // 입사일
    //   status: await data?.status, // 현상태
    // };

    const accessToken = await generateAccessToken(innerData);
    const response = NextResponse.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: '로그인 성공적',
    });

    return response;
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
