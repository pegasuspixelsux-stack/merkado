import type { Metadata } from "next";
import Dashboard from "@/components/admin/Dashboard";

export const metadata: Metadata = {
  title: "Inventario | Panel de Merkado",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
