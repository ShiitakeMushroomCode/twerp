import styles from '@/styles/NavBar.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function AS() {
  return (
    <div className={styles.authLinks}>
      <Link href="/mypage" className={styles.icon} title="마이페이지">
        <Image src="/mypage.png" alt="마이페이지" width={35} height={35} />
      </Link>
      <Link href="/signout" className={styles.icon} title="로그아웃">
        <Image src="/logout.png" alt="로그아웃" width={35} height={35} />
      </Link>
    </div>
  );
}
