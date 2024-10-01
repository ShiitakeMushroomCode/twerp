import styles from '@/styles/MenuBar.module.css';
import Link from 'next/link';

export default function MenuBar() {
  return (
    <div className={styles.menu}>
      <div className={styles.menuContent}>
        <div className={styles.menuItem}>
          거래처
          <div className={styles.dropdown}>
            <Link href="/client-list" className={styles.link}>
              거래처 목록확인
            </Link>
            <Link href="/client-add" className={styles.link}>
              거래처 추가하기
            </Link>
          </div>
        </div>

        <div className={styles.menuItem}>
          매출
          <div className={styles.dropdown}>
            <Link href="/sales-list" className={styles.link}>
              매출 확인
            </Link>
            <Link href="/sales-add" className={styles.link}>
              매입 입력
            </Link>
          </div>
        </div>

        <div className={styles.menuItem}>
          매입
          <div className={styles.dropdown}>
            <Link href="/purchase-list" className={styles.link}>
              매입 확인
            </Link>
            <Link href="/purchase-add" className={styles.link}>
              매입 입력
            </Link>
          </div>
        </div>

        <div className={styles.menuItem}>
          재고
          <div className={styles.dropdown}>
            <Link href="/inventory-list" className={styles.link}>
              재고 확인
            </Link>
            <Link href="/inventory-add" className={styles.link}>
              재고 추가
            </Link>
          </div>
        </div>

        <div className={styles.menuItem}>
          세금계산서
          <div className={styles.dropdown}>
            <Link href="/invoice-list" className={styles.link}>
              세금계산서 내역
            </Link>
            <Link href="/invoice-send" className={styles.link}>
              세금계산서 발송
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
