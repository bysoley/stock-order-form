export function formatKRW(value: number): string {
  return value.toLocaleString('ko-KR') + '원'
}

export function formatQuantity(value: number): string {
  return value.toLocaleString('ko-KR') + '주'
}
