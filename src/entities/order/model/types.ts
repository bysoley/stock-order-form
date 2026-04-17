// as const: 객체 값을 string이 아닌 리터럴 타입('현재가')으로 좁힘
// 없으면 ORDER_TYPE.CURRENT의 타입이 string이 되어 OrderType과 호환 불가
export const ORDER_TYPE = {
  CURRENT: '현재가',
  MARKET: '시장가',
} as const;

export type OrderType = (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];

export const ORDER_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface Order {
  stockId: string
  orderType: OrderType
  price: number | null
  quantity: number
}
