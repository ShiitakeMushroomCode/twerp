'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from './NotFound.module.css';

export default function NotFound() {
  const pathname = usePathname();
  const hasLogged = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ pathname }),
    });

    setTimeout(() => {
      router.push('/');
    }, 2500);
  }, [pathname]);

  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>존재하지 않는 페이지입니다.</p>
      <p className={styles.redirectMessage}>홈으로 이동 중입니다...</p>
    </div>
  );
}
