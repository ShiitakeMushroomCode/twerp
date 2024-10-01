import styles from '@/styles/NavBar.module.css';
import Link from 'next/link';

export default function NavBar() {
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          WERP
        </Link>

        <div className={styles.rightLinks}>
          <Link href="/signin" className={styles.link}>
            로그인
          </Link>
          <Link href="/signup" className={styles.link}>
            회원가입
          </Link>
        </div>
      </nav>
    </div>
  );
}
