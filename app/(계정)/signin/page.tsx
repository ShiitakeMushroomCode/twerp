import SigninForm from '@/components/Auth/signin';

export const metadata = {
  title: '로그인',
};

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  return <SigninForm />;
}
