import Link from 'next/link';
import styles from './NavBar.module.css';

export default function BS() {
  return (
    <div className={styles.authLinks}>
      <Link href="/signin" className={styles.link} replace>
        로그인
      </Link>
    </div>
  );
}
