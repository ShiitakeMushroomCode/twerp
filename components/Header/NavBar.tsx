import styles from '@/styles/NavBar.module.css';
import { getLoggedin } from '@/util/getLoggedin';
import Link from 'next/link';
import AS from './AfterSignIn';
import BS from './BeforeSignIn';

export default async function NavBar() {
  const isLoggedIn = await getLoggedin();

  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} title="홈으로 이동">
          WERP
        </Link>

        <div className={styles.rightLinks}>{isLoggedIn ? <AS /> : <BS />}</div>
      </nav>
    </div>
  );
}
