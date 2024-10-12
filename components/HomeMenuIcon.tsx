import Image from 'next/image';
import Link from 'next/link';

export default function HomeMenuIcon({ href, src, alt, title }) {
  return (
    <Link href={href} style={{ width: '150px', height: '150px' }}>
      <Image width={150} height={150} src={src} alt={alt} title={title}></Image>
    </Link>
  );
}
