import { atom } from "jotai";
import { ORDER_TYPE, type OrderType } from "../../../entities/order/model/types";
import { stockAtom } from "../../../entities/stock/model/stockAtom";

export const priceTypeAtom = atom<OrderType>(ORDER_TYPE.CURRENT);

export const priceAtom = atom<number | null>((get) => {
  const priceType = get(priceTypeAtom);
  if (priceType === ORDER_TYPE.MARKET) return null;
  return get(stockAtom).currentPrice;
});