import SigninForm from '@/components/Auth/signin';
import { cookies } from 'next/headers';

export const metadata = {
  title: '로그인',
};

async function signin(formData: FormData) {
  'use server';
  try {
    const data = {
      id: formData.get('phone_number').toString().replace(/-/g, ''),
      password: formData.get('password'),
    };
    const response = await fetch(`${process.env.API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      cookies().set({
        name: 'accessToken',
        value: data.accessToken,
        httpOnly: true,
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'strict',
        secure: true,
      });
      cookies().set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'strict',
        secure: true,
      });
      return await data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  return <SigninForm signin={signin} />;
}
