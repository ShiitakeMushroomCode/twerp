import styles from '@/styles/MenuBar.module.css';
import Link from 'next/link';

const erpMenuItems = [
  {
    title: '거래처',
    links: [
      { href: '/client-list', label: '거래처 목록확인' },
      { href: '/client-add', label: '거래처 추가하기' },
    ],
  },
  {
    title: '매출',
    links: [
      { href: '/sales-list', label: '매출 확인' },
      { href: '/sales-add', label: '매입 입력' },
    ],
  },
  {
    title: '매입',
    links: [
      { href: '/purchase-list', label: '매입 확인' },
      { href: '/purchase-add', label: '매입 입력' },
    ],
  },
  {
    title: '제품',
    links: [
      { href: '/items-list', label: '제품 확인' },
      { href: '/items-add', label: '제품 추가' },
    ],
  },
  {
    title: '재고',
    links: [
      { href: '/inventory-list', label: '재고 확인' },
      { href: '/inventory-add', label: '재고 추가' },
    ],
  },
  {
    title: '세금계산서',
    links: [
      { href: '/invoice-list', label: '세금계산서 내역' },
      { href: '/invoice-send', label: '세금계산서 발송' },
    ],
  },
];

export default function MenuBar() {
  return (
    <div className={styles.menu}>
      <div className={styles.menuContent}>
        {erpMenuItems.map((item, index) => (
          <div key={index} className={styles.menuItem}>
            {item.title}
            <div className={styles.dropdown}>
              {item.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
