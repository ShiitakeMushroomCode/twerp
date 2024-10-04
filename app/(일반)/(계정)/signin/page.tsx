import SinginCom from '@/components/Auth/signin';

export const metadata = {
  title: '로그인',
};

export default async function SignInPage() {
  async function signin(formData: FormData) {
    'use server';
    console.log(formData);
  }

  return <SinginCom signin={signin} />;
}
