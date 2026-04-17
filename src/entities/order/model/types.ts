export type OrderType = '현재가' | '시장가'
export type OrderStatus = 'idle' | 'loading' | 'success' | 'error'

export interface Order {
  stockId: string
  orderType: OrderType
  price: number | null
  quantity: number
}
