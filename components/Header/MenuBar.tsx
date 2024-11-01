'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import styles from './MenuBar.module.css';

// 메뉴 항목 정의
const erpMenuItems = [
  { title: '거래처 목록', href: '/client-list' },
  { title: '매출 정보', href: '/sales-list' },
  { title: '매입 정보', href: '/purchase-list' },
  { title: '제품 목록', href: '/items-list' },
  // 추가 메뉴 항목이 필요하면 여기에 추가하세요
];

export default function MenuBar() {
  const pathname = usePathname(); // 현재 페이지의 경로를 가져옴
  const router = useRouter(); // 라우터 인스턴스를 가져옴

  // 리프레시가 필요한 경로 목록
  const isListRoute = (path) => path.endsWith('-list');

  const handleClick = useCallback(
    (href) => (e) => {
      // 클릭한 링크의 href가 현재 경로와 일치하고, 경로가 'list'로 끝나는 경우
      if (href === pathname && isListRoute(pathname)) {
        e.preventDefault();
        window.location.reload();
      }
    },
    [pathname, router]
  );

  return (
    <nav className={styles.menu}>
      <div className={styles.toolbar}>
        <div className={styles.menuContent}>
          {erpMenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`${styles.menuItem} ${pathname === item.href ? styles.active : ''}`}
              onClick={handleClick(item.href)}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
