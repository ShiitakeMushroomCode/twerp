import { isEmpty } from '@/util/lo';
import {
  deleteVerificationToken,
  getTokenUserData,
  getVerificationToken,
  updateEmail,
  updatePassword,
  updatePhoneNumber,
} from '@/util/token';
import { ACT } from 'auth';
import { jwtVerify } from 'jose';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { inputCode, newData, type } = await request.json();
    const userId = ((await getTokenUserData()) as ACT).userId;
    // console.log(userId, inputCode, newEmail);

    if (isEmpty(inputCode)) {
      return NextResponse.json({ error: '인증 토큰이 유효하지 않거나 만료되었습니다.' }, { status: 400 });
    }
    if (isEmpty(newData)) {
      return NextResponse.json({ error: '변경할 이메일이 유효하지 않습니다.' }, { status: 400 });
    }
    if (isEmpty(userId)) {
      return NextResponse.json({ error: 'userId가 입력되지 않았습니다.' }, { status: 400 });
    }
    if (isEmpty(type)) {
      return NextResponse.json({ error: '잘못된 입력입니다.' }, { status: 400 });
    }

    // 데이터베이스에서 JWT 가져오기
    const token = await getVerificationToken(userId);
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 존재하지 않습니다.' }, { status: 400 });
    }

    // JWT 검증
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.cn === inputCode) {
      // 인증 성공, 이메일 업데이트
      switch (type) {
        case '이메일':
          await updateEmail(newData);
          break;
        case '전화번호':
          await updatePhoneNumber(newData);
          break;
        case '비밀번호':
          await updatePassword(newData);
          break;
        default:
          return NextResponse.json({ error: '잘못된 입력입니다.' }, { status: 400 });
      }
      // 사용된 토큰 삭제
      await deleteVerificationToken(userId);
      cookies().delete('accessToken');
      revalidatePath('/mypage');
      switch (type) {
        case '이메일':
          return NextResponse.json({ message: `${type}이 성공적으로 변경되었습니다.` }, { status: 200 });
        case '전화번호':
          return NextResponse.json({ message: `${type}가 성공적으로 변경되었습니다.` }, { status: 200 });
        case '비밀번호':
          return NextResponse.json({ message: `${type}가 성공적으로 변경되었습니다.` }, { status: 200 });
        default:
          return NextResponse.json({ error: '잘못된 입력입니다.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: '인증 코드가 올바르지 않습니다.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: '인증 토큰이 유효하지 않거나 만료되었습니다.' }, { status: 400 });
  }
}
