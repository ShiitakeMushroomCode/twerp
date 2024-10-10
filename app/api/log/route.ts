import { NextRequest, NextResponse } from 'next/server';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      const time = new Date(timestamp).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      return `${time} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'not-found.log' })],
});

export async function POST(request: NextRequest) {
  const { pathname } = await request.json();

  // 클라이언트의 IP 주소 가져오기
  let ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('remote-addr') ||
    'Unknown IP';
  ip = ip.replace(/^::ffff:/, '');

  logger.info(`${ip}에서 ${decodeURI(pathname)} 경로에 접근 시도`);

  return NextResponse.json({ message: 'Logged' });
}
