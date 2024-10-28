import SigninForm from '@/components/Auth/signin';

export const metadata = {
  title: '로그인',
};

<<<<<<< HEAD
=======
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
        sameSite: 'lax',
        secure: true,
      });
      cookies().set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
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

>>>>>>> 이게-맞나
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return <SigninForm />;
}
