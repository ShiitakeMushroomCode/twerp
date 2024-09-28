async function getMovie(id: string) {
  const res = await fetch(`${process.env.API_URL}/${id}`);
  return res.json();
}

export default async function MovieTitle({ id }: { id: string }) {
  const movie = await getMovie(id);
  return <h1>{movie.title}</h1>;
}
