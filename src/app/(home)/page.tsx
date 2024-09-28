import Movie from '@/components/movie';
import styles from '@/styles/home.module.css';
import { API_URL } from 'app/constants';

export const metadata = {
  title: 'Home',
};
async function getMovies() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await fetch(API_URL);
  const json = await res.json();
  return json;
}
export default async function Page() {
  const movies = await getMovies();
  return (
    <div className={styles.container}>
      {movies.map((movie) => (
        <Movie key={movie.id} id={movie.id} poster_path={movie.poster_path} title={movie.title} />
      ))}
    </div>
  );
}
