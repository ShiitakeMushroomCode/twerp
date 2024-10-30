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

export function formatPrice(value: number) {
  // 소수점이 있는지 확인 후 처리
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function appendParticle(word, particle) {
  // 한글 음절의 유니코드 범위 확인
  const lastChar = word.charAt(word.length - 1);
  const charCode = lastChar.charCodeAt(0);
  const BASE_CODE = 44032;
  const LAST_CODE = 55203;

  if (charCode < BASE_CODE || charCode > LAST_CODE) {
    // 한글 음절이 아니면 그대로 붙임
    return word + particle;
  }

  // 받침(종성) 여부 확인
  const jongseong = (charCode - BASE_CODE) % 28;

  // 조사 매핑
  const particles = {
    '을/를': jongseong > 0 ? '을' : '를',
    '이/가': jongseong > 0 ? '이' : '가',
    '은/는': jongseong > 0 ? '은' : '는',
    '과/와': jongseong > 0 ? '과' : '와',
    '으로/로': jongseong > 0 && lastChar !== '로' ? '으로' : '로',
    // 추가 조사가 필요하면 여기에 추가
  };

  // 변형 가능한 조사인지 확인
  if (particles[particle]) {
    return `${word}${particles[particle]}`;
  }

  // 변형이 필요 없는 고정 조사 처리
  const fixedParticles = ['의', '에', '에서', '에게', '부터', '까지', '으로'];
  if (fixedParticles.includes(particle)) {
    return `${word}${particle}`;
  }

  // 정의되지 않은 조사일 경우 그대로 붙임
  return `${word}${particle}`;
}
