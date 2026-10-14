import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in | Merkado",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center px-6 py-16">
      <LoginForm />
    </main>
  );
}
