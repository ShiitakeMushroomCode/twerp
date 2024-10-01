import styles from '@/styles/NavBar.module.css';
import Link from 'next/link';

export default function BS() {
  return (
    <div className={styles.authLinks}>
      <Link href="/signin" className={styles.link}>
        로그인
      </Link>
    </div>
  );
}
