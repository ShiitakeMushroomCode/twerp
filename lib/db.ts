import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function getConnection() {
  const conn = await pool.getConnection();
  return conn;
}

export async function executeQuery(query: string, params?: any[]) {
  const conn = await getConnection();
  try {
    const results = await conn.query(query, params);
    return results;
  } catch (err) {
    throw new Error('Query execution failed');
  } finally {
    conn.end();
  }
}
