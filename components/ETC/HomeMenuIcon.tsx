import Image from 'next/image';
import Link from 'next/link';
import styles from './HomeMenuIcon.module.css';

export default function HomeMenuIcon({ href, src, alt, title }) {
  return (
    <Link href={href} className={styles.iconLink}>
      <Image width={150} height={150} src={src} alt={alt} priority></Image>
      <p className={styles.iconTitle}>{title}</p>
    </Link>
  );
}
