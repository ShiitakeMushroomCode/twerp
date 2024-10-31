'use client';

import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import styles from './MenuBar.module.css';

//나중에 id별로 바꿀꺼임 아마
const erpMenuItems = [
  { title: '거래처 목록', href: '/client-list' },
  { title: '매출 정보', href: '/sales-list' },
  { title: '매입 정보', href: '/purchase-list' },
  { title: '제품 목록', href: '/items-list' },
  // { title: '재고', href: '/inventory-list' },
  // { title: '세금계산서', href: '/invoice-list' },
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
