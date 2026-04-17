import { atom } from "jotai";
import { accountAtom } from "../../../entities/account/model/accountAtom";
import { priceAtom } from "../../price-type-select/model/atom";

export const quantityAtom = atom<string>('');

export const maxQuantityAtom = atom<number>((get) => {
  const price = get(priceAtom);
  return price == null ? Infinity : Math.floor(get(accountAtom).balance / price);
});