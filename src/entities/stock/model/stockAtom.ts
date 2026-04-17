import { atom } from "jotai";
import type { Stock } from "./types";

export const stockAtom = atom<Stock>({
    id: '005930',
    name:  '삼성전자',
    currentPrice: 207000
})