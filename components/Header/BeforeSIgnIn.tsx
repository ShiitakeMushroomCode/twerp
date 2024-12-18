'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './NavBar.module.css';

export default function BS() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = async (e) => {
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
        router.push('/signin'); // 이동
      }
    }
  };

  return (
    <div className={styles.authLinks}>
      <Link href="/signin" className={styles.link} onClick={handleClick}>
        로그인
      </Link>
    </div>
  );
}
