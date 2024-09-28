import Link from 'next/link';
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';

export const metadata = {
  title: 'Home',
};

async function getMovies() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const res = await fetch(process.env.API_URL);
  const json = await res.json();
  return json;
}
export default async function Page() {
  const movies = await getMovies();
  return (
    <div>
      <h1>
        {movies.map(
          (movie: {
            id: Key;
            title:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<AwaitedReactNode>;
          }) => (
            <li key={movie.id}>
              <Link href={`/movies/${movie.id}`}>{movie.title}</Link>
            </li>
          )
        )}
      </h1>
    </div>
  );
}
