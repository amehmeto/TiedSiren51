export function isEmptyString(val: string | null): boolean {
  return val !== null && val.trim() !== ''
}
