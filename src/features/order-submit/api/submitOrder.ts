import type { Order } from "../../../entities/order/model/types";

export async function submitOrder(order: Order): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (Math.random() < 0.3) {
    throw new Error("주문에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  console.log("주문 완료:", order);
}
