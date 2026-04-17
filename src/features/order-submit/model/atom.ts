import { atom } from "jotai";
import { ORDER_STATUS, type OrderStatus } from "../../../entities/order/model/types";
import { accountAtom } from "../../../entities/account/model/accountAtom";
import { priceAtom } from "../../price-type-select/model/atom";
import { quantityAtom } from "../../quantity-input/model/atom";

export const orderStatusAtom = atom<OrderStatus>(ORDER_STATUS.IDLE);

export const totalAmountAtom = atom<number>((get) => {
  const price = get(priceAtom);
  const qty = Number(get(quantityAtom));
  return price == null ? 0 : price * qty;
});

export const isValidOrderAtom = atom<boolean>((get) => {
  const qty = Number(get(quantityAtom));
  const totalAmount = get(totalAmountAtom);
  const { balance } = get(accountAtom);
  return qty > 0 && totalAmount <= balance;
});
