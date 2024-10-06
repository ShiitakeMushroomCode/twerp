import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function executeQuery(query: string, params?: any[]) {
  let conn;
  try {
    // console.log('연결');
    conn = await pool.getConnection();
    const results = await conn.query(query, params);
    return results;
  } catch (err) {
    throw new Error('쿼리 좀 똑바로 써라!');
  } finally {
    if (conn) {
      // console.log('연결 반환');
      conn.release(); // 연결을 풀에 반환
    }
  }
}
