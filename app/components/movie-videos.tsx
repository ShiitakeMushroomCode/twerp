async function getVideos(id: string) {
  const res = await fetch(`${process.env.API_URL}/${id}/videos`);
  return res.json();
}

export default async function MovieVideos({ id }: { id: string }) {
  const videos = await getVideos(id);
  return <h5>{JSON.stringify(videos)}</h5>;
}
