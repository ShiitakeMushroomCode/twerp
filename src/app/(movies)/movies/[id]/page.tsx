import MovieInfo, { getMovie } from '@/components/movie-info';
import MovieVideos from '@/components/movie-videos';
import { Suspense } from 'react';

interface IP {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params: { id } }: IP) {
  const movie = await getMovie(id);
  return {
    title: movie.title,
  };
}

export default async function MovieDetail({ params: { id } }: IP) {
  return (
    <div>
      <Suspense fallback={<h1>영화 정보 불러오는 중</h1>}>
        <MovieInfo id={id} />
      </Suspense>
      <Suspense fallback={<h1>영화 영상 불러오는 중</h1>}>
        <MovieVideos id={id} />
      </Suspense>
    </div>
  );
}
