import Link from 'next/link';

export default async function Header() {
  return (
    <header>
      <nav style={{ display: 'flex', gap: '10px' }}>
        <Link href="/">메인</Link>
        <Link href="/signin">로그인</Link>
        <Link href="/signup">회원가입</Link>
      </nav>
    </header>
  );
}
