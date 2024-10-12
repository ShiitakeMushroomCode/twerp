import styles from '@/styles/HomeMenuIcon.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeMenuIcon({ href, src, alt, title }) {
  return (
    <Link href={href} className={styles.iconLink}>
      <Image width={150} height={150} src={src} alt={alt} title={title}></Image>
    </Link>
  );
}
