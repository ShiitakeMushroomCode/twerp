import styles from '@/styles/home.module.css';
export const metadata = {
  title: 'Home',
};
export default async function Page() {
  return (
    <div className={styles.container}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n}>{n}</div>
      ))}
    </div>
  );
}
