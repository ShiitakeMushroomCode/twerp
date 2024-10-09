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
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'database.log' })],
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

// 얘 때문인가
// import mariadb from 'mariadb';

// const pool = mariadb.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   connectionLimit: 500,
//   acquireTimeout: 20000,
//   idleTimeout: 60000,
// });

// export async function executeQuery(query: string, params?: any) {
//   let conn;
//   try {
//     // console.log('연결');
//     const start = process.hrtime();
//     conn = await pool.getConnection();
//     const results = await conn.query(query, params);
//     const elapsed = process.hrtime(start);
//     console.log(
//       `쿼리 실행 시간: ${elapsed[0]}초 ${elapsed[1] / 1000000}ms\n쿼리 : ${query}\n파라미터들 : ${JSON.stringify(
//         params
//       )}\n`
//     );
//     console.log(`현재 연결된 클라이언트 수: active=${pool.activeConnections()} idle=${pool.idleConnections()}\n`);
//     return results;
//   } catch (err) {
//     throw new Error(
//       `쿼리 실행 실패!\n쿼리 : ${query}\n파라미터들 : ${JSON.stringify(params)}\n에러 : ${err.message}\n`
//     );
//   } finally {
//     if (conn) {
//       try {
//         conn.release(); // 연결을 풀에 반환
//         console.log('연결 반환');
//       } catch (releaseErr) {
//         console.error('커넥션 반환 중 오류 발생:', releaseErr.message);
//       }
//     }
//   }
// }
