import { atom } from "jotai";
import type { Account } from "./types";

export const accountAtom = atom<Account>({
    balance: 1_000_000
})