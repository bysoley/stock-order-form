# stock-order-form

주식 매수 주문서 화면 구현 프로젝트. React 19 + TypeScript + Vite 기반 모바일 웹.

## 실행 방법

```bash
bun install
bun dev
```

## 테스트

```bash
bun test
```

---

## 예측 가능한 코드 3원칙

> "시간이 지나서 본인 코드나 동료 코드를 봤을 때 짧은 시간에 이해할 수 있는 코드" — 예측가능성의 정의

### 1. 추상화 레벨 통일

같은 컴포넌트 안에서 추상화 수준이 섞이면 읽는 사람이 문맥을 계속 전환해야 한다.

```tsx
// BAD — 고수준 컴포넌트와 로우레벨 마크업이 섞임
<OrderPanel>
  <h2>삼성전자</h2>           {/* 로우레벨 */}
  <OrderPanel.PriceTab />    {/* 고수준 */}
  <div style={{...}}>        {/* 로우레벨 */}
    <OrderPanel.Quantity />
  </div>
</OrderPanel>

// GOOD — 사용측은 전부 OrderPanel.XXX 수준으로만
<OrderPanel>
  <OrderPanel.Header />
  <OrderPanel.PriceTab />
  <OrderPanel.Quantity />
  <OrderPanel.Submit />
</OrderPanel>
```

`OrderPanel` 내부는 전부 같은 추상화 수준. `<div>`, `<button>` 같은 로우레벨 노출 금지.

### 2. 응집도 — 같은 목적의 코드는 같은 곳에

관련 코드(상태, 핸들러, 마크업)가 흩어지면 변경 시 여러 파일을 찾아다녀야 한다. FSD의 feature 폴더가 이 원칙을 구조로 강제한다.

```
features/quantity-input/
  model/quantityAtom.ts     ← 수량 상태
  model/maxQuantityAtom.ts  ← 수량 관련 파생값
  ui/QuantityInput.tsx      ← 수량 입력 UI
  ui/PercentButtons.tsx     ← 수량 관련 UI
  index.ts
```

`quantity-input`에 관한 모든 것이 한 폴더 안에 있다. 수량 로직을 변경할 때 다른 feature를 건드릴 필요 없다.

### 3. Props Drilling 없는 상태 접근

Jotai atom을 직접 구독하면 중간 컴포넌트가 props를 전달할 필요가 없다. 필요한 컴포넌트가 필요한 atom만 읽는다.

```tsx
// BAD — OrderPanel → QuantityInput → PercentButtons 로 balance props drilling
<OrderPanel balance={balance} maxQty={maxQty} onPercentClick={...} />

// GOOD — 각 컴포넌트가 필요한 atom만 직접 구독
const PercentButtons = () => {
  const maxQty = useAtomValue(maxQuantityAtom)  // Props 불필요
  const setQuantity = useSetAtom(quantityAtom)
  ...
}
```

---

## 아키텍처 설계

### 디렉토리 구조 (FSD)

[Feature-Sliced Design](https://feature-sliced.design/)을 채택했다. 기능 추가/변경 시 영향 범위가 레이어 경계 안에 머물도록 하기 위해서다.

```
src/
  app/           # Provider, 전역 설정
  widgets/       # 독립 실행 가능한 화면 단위 (OrderPanel)
  features/      # 사용자 인터랙션 단위 (price-type-select, quantity-input, order-submit)
  entities/      # 도메인 모델 (stock, account, order)
  shared/        # 순수 유틸, 공통 UI
```

flat 구조 대비 트레이드오프: 초기 세팅 비용이 높다. 그러나 features 간 의존 방향이 명확해져 "어디를 고치면 어디가 깨지는가"를 예측할 수 있다.

---

### 상태 관리 — Jotai

Recoil 대신 Jotai를 선택한 이유:

| | Recoil | Jotai |
|---|---|---|
| 번들 크기 | ~20kb | ~3kb |
| React 18+ 호환 | Concurrent Mode 이슈 존재 | 네이티브 지원 |
| 파생 상태 | `selector` (보일러플레이트 多) | `atom(get => ...)` 인라인 |
| 유지보수 | Meta 팀 관리 불확실 | 활발한 커뮤니티 |

**변경 단위 기반 Atom 설계 원칙**: "무엇이 바뀔 때 이 상태가 바뀌는가"로 atom을 쪼갠다. 파생값은 derived atom으로만 표현하고 `useState`로 관리하지 않는다.

| Atom | 변경 트리거 |
|---|---|
| `stockAtom` | 종목 변경 |
| `priceTypeAtom` | 현재가 ↔ 시장가 탭 전환 |
| `quantityAtom` | 키패드 입력 |
| `orderStatusAtom` | 주문 제출 |
| `priceAtom` *(derived)* | priceType 변경 시 |
| `maxQuantityAtom` *(derived)* | balance 또는 price 변경 시 |
| `totalAmountAtom` *(derived)* | price 또는 quantity 변경 시 |
| `isValidOrderAtom` *(derived)* | totalAmount 또는 quantity 변경 시 |

---

### 런타임 검증 — Zod

TypeScript 타입은 컴파일 타임에만 존재한다. 폼 입력, mock API 응답 같은 런타임 경계에서는 Zod로 검증하고, 타입은 `z.infer<>`로 자동 파생한다.

```typescript
export const OrderSchema = z.object({
  stockId: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
})

export type Order = z.infer<typeof OrderSchema>
```

수동으로 작성한 타입과 Zod 스키마를 별도로 유지하는 이중 관리 문제를 없앤다.

---

### UI 패턴 — Compound Component

`OrderPanel`은 Compound Component 패턴으로 조합한다. 사용측이 레이아웃 구조를 직접 결정할 수 있고, 내부 구현을 노출하지 않는다.

```tsx
<OrderPanel>
  <OrderPanel.Header />
  <OrderPanel.PriceTab />
  <OrderPanel.Quantity />
  <OrderPanel.Percents />
  <OrderPanel.Submit />
</OrderPanel>
```

일반 props drilling 대비 트레이드오프: 컴포넌트 간 암묵적 Context 의존이 생긴다. 이 규모에서는 명시적 이득이 더 크다.

---

### 스타일링 — Emotion

모바일 웹 타겟. CSS-in-JS 중 Emotion을 선택한 이유는 동적 스타일(주문 타입에 따라 컬러 변경 등)을 props로 자연스럽게 처리할 수 있기 때문이다. 정적 사이트라면 vanilla-extract가 더 적합하다.

---

### RSC 미적용 이유

Vite SPA는 서버 런타임이 없어 RSC를 사용할 수 없다. 이 프로젝트는 고빈도 인터랙션(키패드 입력, 실시간 파생값 계산)이 주를 이루므로 대부분의 컴포넌트가 Client Component가 될 것이고, RSC의 이점이 제한적이다.

---

## 도메인 — KRX 호가 단위

한국 주식 시장의 가격 단위 규칙. 가격 범위에 따라 허용 단위가 다르다.

| 가격 범위 | 호가 단위 |
|---|---|
| < 2,000원 | 1원 |
| 2,000 ~ 4,999원 | 5원 |
| 5,000 ~ 19,999원 | 10원 |
| 20,000 ~ 49,999원 | 50원 |
| 50,000 ~ 199,999원 | 100원 |
| 200,000 ~ 499,999원 | 500원 |
| ≥ 500,000원 | 1,000원 |

구현: `shared/utils/tick.ts` — `getTickSize`, `isValidTick`, `roundToTick`

---

## 구현 범위

### 완료
- [ ] 현재가 / 시장가 탭 전환
- [ ] 수량 커스텀 키패드 입력
- [ ] 10% / 25% / 50% / 최대 버튼
- [ ] 구매 가능 금액 · 최대 구매 가능 주수 표시
- [ ] 잔고 초과 시 주문 버튼 비활성화
- [ ] 주문 제출 로딩 / 성공 / 실패 UX

### 미구현 (범위 외)
- 매도 탭
- 호가창 (실시간 WebSocket)
- 미수거래

---

## 개선 아이디어

- WebSocket으로 실시간 현재가 구독 → `priceAtom`을 외부 시세에 연동
- 주문 확인 바텀시트 추가
- 주문 내역 히스토리 (로컬 스토리지)
