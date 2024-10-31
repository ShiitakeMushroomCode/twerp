import HomeMenuIcon from '@/components/ETC/HomeMenuIcon';
import styles from '@/styles/home.module.css';
export const metadata = {
  title: 'Home',
};

export default async function Page() {
  // 나중에 권한 관리로 할 수 있는 것만 보여주기
  const data1 = [
    { src: '/BusinessCardImage.png', alt: '거래처', title: '거래처 관리', href: '/client-list' },
    { src: '/Items.png', alt: '제품', title: '제품 관리', href: '/items-list' },
    // { src: '/Storage.png', alt: '재고', title: '재고 관리', href: '/inventory-list' },
  ];
  const data2 = [
    { src: '/Sales.png', alt: '판매', title: '판매 관리', href: '/sales-list' },
    { src: '/Purchase.png', alt: '구매', title: '구매 관리', href: '/purchase-list' },
    // { src: '/Invoice.png', alt: '세금계산서', title: '세금 계산서', href: '/invoice-list' },
  ];
  return (
    <div className={styles.container}>
      {data1.map((n) => (
        <HomeMenuIcon href={n.href} src={n.src} alt={n.alt} title={n.title} key={n.title} />
      ))}
      {data2.map((n) => (
        <HomeMenuIcon href={n.href} src={n.src} alt={n.alt} title={n.title} key={n.title} />
      ))}
    </div>
  );
}
