import dotenv from 'dotenv';
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

app.prepare().then(() => {
  createServer(sslOptions, (req, res) => {
    return handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`서버가 https://localhost:${port} 에서 실행 중입니다.`);
  });
});
