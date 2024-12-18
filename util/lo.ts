export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'boolean') {
    return false;
  }

  if (typeof value === 'number') {
    return false;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}
