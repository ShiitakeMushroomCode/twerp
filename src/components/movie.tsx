// 'use client';
import styles from '@/styles/movie.module.css';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';

interface IMP {
  title: string;
  id: string;
  poster_path: string;
}
export default function Movie({ id, poster_path, title }: IMP) {
  // const router = useRouter();
  // const onClick = () => {
  //   router.push(`/movies/${id}`);
  // };
  // <img src={poster_path} alt={title} />
  return (
    <div className={styles.movie}>
      <Link prefetch href={`/movies/${id}`}>
        <img src={poster_path} alt={title} /> <br /> <br />
        {title}
      </Link>
    </div>
  );
}
