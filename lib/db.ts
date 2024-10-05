import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function getConnection() {
  try {
    const conn = await pool.getConnection();
    return conn;
  } catch (err) {
    throw new Error('DB 연결이 안된다니까?');
  }
}

export async function executeQuery(query: string, params?: any[]) {
  const conn = await getConnection();
  try {
    const results = await conn.query(query, params);
    return results;
  } catch (err) {
    throw new Error('쿼리좀 똑바로 써라!');
  } finally {
    conn.end();
  }
}
