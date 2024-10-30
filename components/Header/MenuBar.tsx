'use client';

import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import styles from './MenuBar.module.css'; // CSS 모듈을 사용하는 경우

const erpMenuItems = [
  { title: '거래처 확인', href: '/client-list' },
  { title: '매출 확인', href: '/sales-list' },
  { title: '매입 확인', href: '/purchase-list' },
  { title: '제품 확인', href: '/items-list' },
  { title: '재고 확인', href: '/inventory-list' },
  { title: '세금계산서', href: '/invoice-list' },
];

export default function MenuBar() {
  return (
    <AppBar position="static" color="default" className={styles.menu}>
      <Toolbar className={styles.toolbar}>
        <div className={styles.menuContent}>
          {erpMenuItems.map((item, index) => (
            <Button key={index} color="inherit" component={Link} href={item.href} className={styles.menuItem}>
              <Typography variant="body1">{item.title}</Typography>
            </Button>
          ))}
        </div>
      </Toolbar>
    </AppBar>
  );
}
