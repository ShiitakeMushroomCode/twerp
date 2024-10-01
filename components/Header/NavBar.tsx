import styles from '@/styles/NavBar.module.css';
import Link from 'next/link';
import getSession from 'temp/Session';
import AS from './AfterSIgnIn';
import BS from './BeforeSIgnIn';

export default function NavBar() {
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} title="홈으로 이동">
          WERP
        </Link>

        <div className={styles.rightLinks}>{getSession() ? <AS /> : <BS />}</div>
      </nav>
    </div>
  );
}
