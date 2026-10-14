import type { Metadata } from "next";
import Dashboard from "@/components/admin/Dashboard";

export const metadata: Metadata = {
  title: "Inventory | Merkado Admin",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
