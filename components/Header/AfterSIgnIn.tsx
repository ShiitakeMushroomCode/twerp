'use client';

import { getLoggedin } from '@/util/getLoggedin';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import BS from './BeforeSignIn';
import styles from './NavBar.module.css';

export default function AS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkLogin() {
      const loggedIn = await getLoggedin();
      setIsLoggedIn(loggedIn);
    }
    checkLogin();
  }, []);

  const handleClick = async (e, href) => {
    if (pathname.includes('edit') || pathname.includes('add')) {
      e.preventDefault();
      const result = await Swal.fire({
        title: '변경사항이 저장되지 않았습니다!',
        text: '페이지를 이동하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '이동',
        cancelButtonText: '취소',
      });

      if (result.isConfirmed) {
        router.push(href); // 이동
      }
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div className={styles.authLinks}>
          <Link href="/mypage" className={styles.icon} title="마이페이지" onClick={(e) => handleClick(e, '/mypage')}>
            <Image loading="lazy" src="/mypage.png" alt="마이페이지" width={35} height={35} />
          </Link>
          <Link href="/signout" className={styles.icon} title="로그아웃" onClick={(e) => handleClick(e, '/signout')}>
            <Image loading="lazy" src="/logout.png" alt="로그아웃" width={35} height={35} />
          </Link>
        </div>
      ) : (
        <BS />
      )}
    </div>
  );
}
