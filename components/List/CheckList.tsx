import { cookies } from 'next/headers';
import ListItem from './ListItem';
// 이게 어따 쓰는거지? 그냥 테스트용이구나
async function getTest() {
  try {
    const response = await fetch(`${process.env.API_URL}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('데이터를 가져오는 데 오류 발생:', error);
    throw error;
  }
}

export default async function CheckList({ option }) {
  const test = await getTest();
  return (
    <div>
      {Array.isArray(test) && test.length > 0 ? (
        test.map((t) => <ListItem key={t.company_id} data={t.company_name} />)
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
}
