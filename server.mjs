import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import { createServer } from 'https';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.SERVER_PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslPath = path.join(__dirname, process.env.SSL);
const sslOptions = {
  key: fs.readFileSync(path.join(sslPath, process.env.KEY)),
  cert: fs.readFileSync(path.join(sslPath, process.env.CERT)),
  ca: fs.readFileSync(path.join(sslPath, process.env.CA)),
};

// Express 앱 설정
const server = express();

// 사용자별 Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 사용자당 최대 10번의 요청 허용
  message: '이 작업은 1분에 10번만 가능합니다. 다시 시도할 수 없습니다.',
  keyGenerator: (req) => {
    // 예시로 accessToken 또는 IP 주소를 키로 사용하여 사용자별로 제한
    return req.headers['x-access-token'] || req.ip;
  },
});

// 특정 경로에 Rate Limiting 적용 (로그인 예시)
server.use('/api/auth', limiter);

// Next.js 요청 처리
server.all('*', (req, res) => {
  return handle(req, res);
});

// HTTPS 서버 설정
app.prepare().then(() => {
  createServer(sslOptions, server).listen(port, (err) => {
    if (err) throw err;
    console.log(`서버가 https://localhost:${port} 에서 실행 중입니다.`);
  });
});

// import dotenv from 'dotenv';
// import fs from 'fs';
// import { createServer } from 'https';
// import next from 'next';
// import path from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config({ path: '.env.local' });

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();
// const port = process.env.SERVER_PORT;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const sslPath = path.join(__dirname, process.env.SSL);
// const sslOptions = {
//   key: fs.readFileSync(path.join(sslPath, process.env.KEY)),
//   cert: fs.readFileSync(path.join(sslPath, process.env.CERT)),
//   ca: fs.readFileSync(path.join(sslPath, process.env.CA)),
// };

// app.prepare().then(() => {
//   createServer(sslOptions, (req, res) => {
//     return handle(req, res);
//   }).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`서버가 https://localhost:${port} 에서 실행 중입니다.`);
//   });
// });
