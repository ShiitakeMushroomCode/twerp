import AS from './AfterSignIn';
import HomeLink from './HomeLink';
import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>
        <HomeLink />

        <div className={styles.rightLinks}>
          {' '}
          <AS />
        </div>
      </nav>
    </div>
  );
}
