import Link from 'next/link';
import BS from './BeforeSignIn';
import styles from './NavBar.module.css';

export default async function NNavBar() {
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} title="홈으로 이동">
          WERP
        </Link>

        <div className={styles.rightLinks}>
          <BS />
        </div>
      </nav>
    </div>
  );
}
