import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export async function POST(request: NextRequest) {
  const accessTokenValue = cookies().get('accessToken').value;
  try {
    await jwtVerify(accessTokenValue, secret);
    return NextResponse.json({ msg: '로그인 성공' }, { status: 200 });
  } catch (e) {
    const refreshTokenValue = cookies().get('refreshToken').value;
    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    if (res.ok) {
      const newAccessToken = (await res.json()).accessToken;
      cookies().set({
        name: 'accessToken',
        value: newAccessToken,
        httpOnly: true,
        maxAge: 60 * 60, // 1시간
        path: '/',
        sameSite: 'strict',
        secure: true,
      });
      return NextResponse.json({ msg: '리로딩 성공' }, { status: 200 });
    }
    return NextResponse.json({ error: '로그인 실패' }, { status: 401 });
  }
}
