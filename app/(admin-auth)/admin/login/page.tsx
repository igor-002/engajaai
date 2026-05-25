import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata = { title: "Admin login · EngajaAI" };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
