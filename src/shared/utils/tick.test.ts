import { describe, it, expect } from 'vitest'
import { getTickSize, isValidTick, roundToTick } from './tick'

describe('getTickSize', () => {
  it.each([
    [1, 1],
    [1_999, 1],
    [2_000, 5],
    [4_999, 5],
    [5_000, 10],
    [19_999, 10],
    [20_000, 50],
    [49_999, 50],
    [50_000, 100],
    [199_999, 100],
    [200_000, 500],
    [499_999, 500],
    [500_000, 1_000],
    [207_000, 500],
  ])('price %i → tick %i', (price, expected) => {
    expect(getTickSize(price)).toBe(expected)
  })
})

describe('isValidTick', () => {
  it('207,000원은 500원 단위로 유효', () => {
    expect(isValidTick(207_000)).toBe(true)
  })
  it('207,300원은 500원 단위로 무효', () => {
    expect(isValidTick(207_300)).toBe(false)
  })
  it('49,999원은 50원 단위로 무효', () => {
    expect(isValidTick(49_999)).toBe(false)
  })
  it('50,000원은 100원 단위로 유효', () => {
    expect(isValidTick(50_000)).toBe(true)
  })
})

describe('roundToTick', () => {
  it('207,300 → 207,500', () => {
    expect(roundToTick(207_300)).toBe(207_500)
  })
  it('49,950 → 50,000', () => {
    expect(roundToTick(49_950)).toBe(50_000)
  })
  it('1,999 → 1,999 (1원 단위)', () => {
    expect(roundToTick(1_999)).toBe(1_999)
  })
})
