import { getLoggedin } from '@/util/getLoggedin';
import AS from './AfterSignIn';
import BS from './BeforeSignIn';
import HomeLink from './HomeLink';
import styles from './NavBar.module.css';

export default async function NavBar() {
  const isLoggedIn = await getLoggedin();

  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <HomeLink />

        <div className={styles.rightLinks}>{isLoggedIn ? <AS /> : <BS />}</div>
      </nav>
    </div>
  );
}
