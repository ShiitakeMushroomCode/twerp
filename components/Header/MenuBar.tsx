'use client';

import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './MenuBar.module.css';

// 메뉴 항목 정의
const erpMenuItems = [
  { title: '거래처 목록', href: '/client-list' },
  { title: '매출 정보', href: '/sales-list' },
  { title: '매입 정보', href: '/purchase-list' },
  { title: '제품 목록', href: '/items-list' },
  // { title: '재고', href: '/inventory-list' },
  // { title: '세금계산서', href: '/invoice-list' },
];

export default function MenuBar() {
  const pathname = usePathname(); // 현재 페이지의 경로를 가져옴
  const router = useRouter(); // 라우터 인스턴스를 가져옴

  // 리프레시가 필요한 경로 목록
  const ROUTES = ['/sales-list', '/client-list', '/purchase-list', '/items-list'];

  const handleClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // 클릭한 링크의 href가 현재 경로와 일치하고, 지정된 ROUTES에 포함되는 경우
    if (href === pathname && ROUTES.includes(pathname)) {
      router.replace(pathname);
    }
  };

  return (
    <AppBar position="static" color="default" className={styles.menu}>
      <Toolbar className={styles.toolbar}>
        <div className={styles.menuContent}>
          {erpMenuItems.map((item, index) => (
            <Button
              key={index}
              color="inherit"
              component={Link}
              href={item.href}
              onClick={handleClick(item.href)}
              className={styles.menuItem}
            >
              <Typography variant="body1">{item.title}</Typography>
            </Button>
          ))}
        </div>
      </Toolbar>
    </AppBar>
  );
}
