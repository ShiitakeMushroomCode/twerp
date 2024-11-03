'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './NavBar.module.css';

export default function HomeLink() {
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
        router.push('/'); // 이동
      }
    }
  };

  return (
    <Link href="/" className={styles.logo} title="홈으로 이동" onClick={handleClick}>
      WERP
    </Link>
  );
}
