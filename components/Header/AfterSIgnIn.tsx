import styles from '@/styles/NavBar.module.css';
import { getLoggedin } from '@/util/getLoggedin';
import Image from 'next/image';
import Link from 'next/link';
import BS from './BeforeSignIn';

export default async function AS() {
  const isLoggedIn = await getLoggedin();
  return (
    <div>
      {isLoggedIn ? (
        <div className={styles.authLinks}>
          <Link href="/mypage" className={styles.icon} title="마이페이지">
            <Image loading="lazy" src="/mypage.png" alt="마이페이지" width={35} height={35} />
          </Link>
          <Link href="/signout" className={styles.icon} title="로그아웃">
            <Image loading="lazy" src="/logout.png" alt="로그아웃" width={35} height={35} />
          </Link>
        </div>
      ) : (
        <BS />
      )}
    </div>
  );
}
