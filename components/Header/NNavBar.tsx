import HomeLink from '@/components/Header/HomeLink';
import BS from './BeforeSignIn';
import styles from './NavBar.module.css';

export default function NNavBar() {
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <HomeLink />

        <div className={styles.rightLinks}>
          <BS />
        </div>
      </nav>
    </div>
  );
}
