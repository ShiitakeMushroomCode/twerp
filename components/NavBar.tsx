import styles from '@/styles/NavBar.module.css';
import Link from 'next/link';
import AS from './AfterSIgnIn';
import BS from './BeforeSIgnIn';

export default function NavBar() {
  const session = { profile: '' };
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} title="홈으로 이동">
          WERP
        </Link>

        <div className={styles.rightLinks}>{session ? <AS /> : <BS />}</div>
      </nav>
    </div>
  );
}
