'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Logging() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) {
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pathname }),
      });
    }
  }, [pathname]);
  return null;
}
