import { removeRefreshTokenFromDB } from '@/util/token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (refreshToken) {
    await removeRefreshTokenFromDB(refreshToken);
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('refreshToken');
  return response;
}
