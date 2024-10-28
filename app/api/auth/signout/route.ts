import { removeRefreshTokenFromDB } from '@/util/token';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const refreshToken = await data?.refreshToken?.value;
  if (!refreshToken) {
    NextResponse.json({ message: '로그아웃 할 리프레시 토큰이 없음' });
  } else {
    NextResponse.json({ message: '리프레시 토큰 삭제 함 ㅇㅇ' });
  }
  removeRefreshTokenFromDB(await refreshToken);
  cookies().delete('accessToken');
  cookies().delete('refreshToken');
  redirect(`${process.env.SITE_URL}/signin`);
}
