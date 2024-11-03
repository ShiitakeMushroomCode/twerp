'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Swal from 'sweetalert2';
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
  const pathname = usePathname();
  const router = useRouter();

  // 특정 경로가 'edit' 또는 'add'를 포함하는지 확인하는 함수
  const isEditOrAddRoute = () => {
    return pathname.includes('edit') || pathname.includes('add');
  };

  const handleClick = useCallback(
    (href) => async (e) => {
      if (isEditOrAddRoute()) {
        e.preventDefault(); // 기본 링크 동작을 막습니다.

        const result = await Swal.fire({
          title: '변경사항이 저장되지 않았습니다!',
          text: '페이지를 이동하시겠습니까?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '이동',
          cancelButtonText: '취소',
        });

        if (result.isConfirmed) {
          router.push(href); // 사용자가 "이동"을 선택한 경우에만 페이지 이동
        }
      } else {
        // 클릭한 링크의 href가 현재 경로와 일치하고, 경로가 'list'로 끝나는 경우
        if (href === pathname && href.endsWith('-list')) {
          e.preventDefault();
          window.location.reload();
        }
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
              className={`${styles.menuItem} ${pathname.startsWith(item.href.split('-')[0]) ? styles.active : ''}`}
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
