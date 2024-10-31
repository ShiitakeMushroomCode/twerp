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
