import SignOutForm from '@/components/Auth/signout';
import { removeRefreshTokenFromDB } from '@/util/token';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '로그아웃',
};
async function SignOut() {
  'use server';
  cookies().set('accessToken', '', { maxAge: 0, path: '/', domain:'werp.p-e.kr' });
  if (cookies().has('refreshToken')) {
    removeRefreshTokenFromDB(cookies().get('refreshToken')?.value);
    cookies().set('refreshToken', '', { maxAge: 0, path: '/', domain:'werp.p-e.kr' });
  }
  redirect(`${process.env.SITE_URL}/signin`);
}
export default async function SignOutPage() {
  return <SignOutForm signout={SignOut} />;
}
