import { createPool } from 'mysql2/promise';
import winston from 'winston';

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${new Date(timestamp).toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        })} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [/*new winston.transports.Console(), */ new winston.transports.File({ filename: 'database.log' })],
});

// 데이터베이스 풀 생성
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 500,
  queueLimit: 0,
});

// 쿼리 실행 함수
export async function executeQuery(query: string, params?: any) {
  let conn;
  try {
    // logger.info(`쿼리 실행 시작: ${query}, 파라미터: ${JSON.stringify(params)}`);
    logger.info(`쿼리 실행 시작`);
    conn = await pool.getConnection();
    const start = process.hrtime();

    const [results] = await conn.execute(query, params);

    const elapsed = process.hrtime(start);
    logger.info(`쿼리 실행 완료: ${query}, 실행 시간: ${elapsed[0]}초 ${elapsed[1] / 1000000}ms`);

    return results;
  } catch (err) {
    logger.error(`쿼리 실행 오류: ${query}, 에러: ${err.message}`);
    throw new Error(`쿼리 실행 실패! 에러: ${err.message}`);
  } finally {
    if (conn) {
      try {
        conn.release();
        logger.info('연결 반환');
      } catch (releaseErr) {
        logger.error('커넥션 반환 중 오류 발생:', releaseErr.message);
      }
    }
  }
}
