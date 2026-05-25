"use server";

import { revalidatePath } from "next/cache";
import { markOrderFulfilled } from "@/lib/data/orders";
import { requireAdminAal2 } from "@/lib/auth/admin-guard";
import { logAdminAction } from "@/lib/auth/audit";

export async function toggleFulfilledAction(orderId: string, fulfilled: boolean) {
  await requireAdminAal2();
  await markOrderFulfilled(orderId, fulfilled);
  await logAdminAction({
    action: "order.fulfill",
    target_table: "orders",
    target_id: orderId,
    success: true,
    meta: { fulfilled },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
