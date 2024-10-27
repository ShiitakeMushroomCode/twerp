export function isEmpty(value: any): boolean {
  if (value == null) return true; // null 또는 undefined
  if (typeof value === 'object') return Object.keys(value).length === 0; // 객체
  if (typeof value === 'string') return value.trim().length === 0; // 문자열
  if (Array.isArray(value)) return value.length === 0; // 배열
  return false;
}

export function isEqual(value: any, other: any): boolean {
  if (value === other) return true; // 기본적인 비교 (엄격한 동등 비교)

  if (typeof value !== 'object' || typeof other !== 'object' || value === null || other === null) {
    return false;
  }

  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(other);

  if (valueKeys.length !== otherKeys.length) return false;

  for (let key of valueKeys) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
}

export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function cloneDeep(value: any): any {
  if (Array.isArray(value)) {
    return value.map(cloneDeep); // 배열의 깊은 복사
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = cloneDeep(value[key]);
      return acc;
    }, {} as any);
  } else {
    return value; // 기본 타입의 값은 그대로 반환
  }
}
