import HomeMenuIcon from '@/components/ETC/HomeMenuIcon';
import styles from '@/styles/home.module.css';
import { erpMenuItems } from '@/util/getErpMenuItems';
export const metadata = {
  title: 'Home',
};

export default async function Page() {
  // 나중에 권한 관리로 할 수 있는 것만 보여주기

  return (
    <div className={styles.container}>
      {erpMenuItems.map((n) => (
        <HomeMenuIcon href={n.href} src={n.src} alt={n.alt} title={n.title} key={n.title} />
      ))}
    </div>
  );
}
