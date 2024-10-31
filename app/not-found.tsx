'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

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
    }, 3000);
  }, [pathname]);

  return <div>존재하지 않는 페이지입니다.</div>;
}
