import styles from '@/styles/Footer.module.css';

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerItem}>&copy; 2024 Choi Geon. All rights reserved.</div>
        <div className={styles.rightLinks}>
          <div className={styles.footerItem}>
            <a href="/privacy-policy" className={styles.link}>
              개인정보보호정책
            </a>
          </div>
          <div className={styles.footerItem}>
            <a href="/terms-of-service" className={styles.link}>
              이용 약관
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
