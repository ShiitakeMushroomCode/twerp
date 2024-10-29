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
export function formatPrice(price: number): string {
  if (isNaN(price)) return 'N/A';

  // 소수점 2자리까지 표시하고, 천 단위로 쉼표를 추가
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
