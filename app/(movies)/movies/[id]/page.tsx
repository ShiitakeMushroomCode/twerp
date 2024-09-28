import MovieTitle from 'app/components/movie-title';
import MovieVideos from 'app/components/movie-videos';
import { Suspense } from 'react';

export const metadata = {
  title: 'Movie',
};

export default async function MovieDetail({ params: { id } }: { params: { id: string } }) {
  return (
    <div>
      <Suspense fallback={<h1>영화 제목 불러오는 중</h1>}>
        <MovieTitle id={id} />
      </Suspense>
      <Suspense fallback={<h1>영화 영상 불러오는 중</h1>}>
        <MovieVideos id={id} />
      </Suspense>
    </div>
  );
}
