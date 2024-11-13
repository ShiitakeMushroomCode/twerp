import emailQueue from '@/util/emailQueue';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId, to, subject, cn, html, option, id, text } = await request.json();
  const TokenData = (await getTokenUserData()) as ACT;

  try {
    // Bull 큐에 작업 추가
    await emailQueue.add({
      to: option === 'MyPage' ? TokenData['email'] : to,
      subject,
      html,
      text,
      option,
      id,
      userId: option === 'MyPage' ? TokenData['userId'] : userId,
      cn,
      companyIdData: TokenData['companyId']['data'],
    });

    return NextResponse.json({ message: '이메일 전송 작업이 큐에 추가되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '이메일 전송 작업을 큐에 추가하는 데 실패했습니다.' }, { status: 500 });
  }
}
