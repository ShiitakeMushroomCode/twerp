import { isEmpty } from '@/util/lo';
import { deleteVerificationToken, getTokenUserData, getVerificationToken, updatePhoneNumber } from '@/util/token';
import { ACT } from 'auth';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { inputCode, newPhoneNumber } = await request.json();
    const userId = ((await getTokenUserData()) as ACT).userId;
    // console.log(userId, inputCode, newPhoneNumber);

    if (isEmpty(inputCode)) {
      return NextResponse.json({ error: '인증 토큰이 유효하지 않거나 만료되었습니다.' }, { status: 400 });
    }
    if (isEmpty(newPhoneNumber)) {
      return NextResponse.json({ error: '변경할 휴대폰 번호가 유효하지 않습니다.' }, { status: 400 });
    }
    if (isEmpty(userId)) {
      return NextResponse.json({ error: 'userId가 입력되지 않았습니다.' }, { status: 400 });
    }

    // 데이터베이스에서 JWT 가져오기
    const token = await getVerificationToken(userId);
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 존재하지 않습니다.' }, { status: 400 });
    }

    // JWT 검증
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.cn === inputCode) {
      // 인증 성공, 전화번호 업데이트
      await updatePhoneNumber(userId, newPhoneNumber);
      // 사용된 토큰 삭제
      await deleteVerificationToken(userId);
      return NextResponse.json({ message: '전화번호가 성공적으로 변경되었습니다.' }, { status: 200 });
    } else {
      return NextResponse.json({ error: '인증 코드가 올바르지 않습니다.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: '인증 토큰이 유효하지 않거나 만료되었습니다.' }, { status: 400 });
  }
}
