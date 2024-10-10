'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function NotFound() {
  const pathname = usePathname();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pathname }),
    });
  }, [pathname]);

  return <div>존재하지 않는 페이지입니다.</div>;
}
