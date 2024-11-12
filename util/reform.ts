export function formatPhoneNumber(value: string): string {
  const cleanValue = value.replace(/[^0-9]/g, '');
  const length = cleanValue.length;
  if (length < 4) {
    return cleanValue;
  } else if (length < 7) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  } else if (length <= 10) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 6)}-${cleanValue.slice(6)}`;
  } else if (length === 11) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}-${cleanValue.slice(7)}`;
  } else if (length === 12) {
    return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 8)}-${cleanValue.slice(8)}`;
  } else {
    return cleanValue;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPrice(value: number) {
  // 소수점이 있는지 확인 후 처리
  if (value <= 0) {
    return 0;
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function appendParticle(name) {
  //name의 마지막 음절의 유니코드(UTF-16)
  const charCode = name.charCodeAt(name.length - 1);

  //유니코드의 한글 범위 내에서 해당 코드의 받침 확인
  const consonantCode = (charCode - 44032) % 28;

  if (consonantCode === 0) {
    //0이면 받침 없음 -> 를
    return `${name}를`;
  }
  //1이상이면 받침 있음 -> 을
  return `${name}을`;
}

export function numberToKorean(number: number | string | null | undefined): string {
  const units = ['', '만', '억', '조', '경'];
  const digits = ['', '십', '백', '천'];
  const numbers = ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

  // null, undefined, 0 처리
  if (number === null || number === undefined || number === 0 || number === '0') {
    return '영';
  }

  // 문자열을 숫자로 변환 (입력이 문자열일 경우)
  const numStr = typeof number === 'string' ? number : number.toString();
  const parts: string[] = [];

  // 숫자를 오른쪽에서부터 네 자리씩 나눔
  let index = numStr.length;
  while (index > 0) {
    parts.unshift(numStr.slice(Math.max(0, index - 4), index));
    index -= 4;
  }

  let result = '';

  // 네 자리 숫자를 한글로 변환하는 함수
  function parseChunk(chunk: string): string {
    let parsedResult = '';
    const length = chunk.length;
    for (let i = 0; i < length; i++) {
      const digit = chunk[i];
      if (digit !== '0') {
        parsedResult += numbers[parseInt(digit) - 1] + digits[length - i - 1];
      }
    }
    return parsedResult;
  }

  // 각 부분을 해석하고 단위를 붙임
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (parseInt(part) !== 0) {
      result += parseChunk(part) + units[parts.length - i - 1];
    }
  }

  return result;
}

// 날짜 형식을 "YYYY년 MM월 DD일 - N"으로 변환하는 함수
export function formatDateWithSequence(dateString: string, sequence: number) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}년 ${month}월 ${day}일 - ${sequence}`;
}
