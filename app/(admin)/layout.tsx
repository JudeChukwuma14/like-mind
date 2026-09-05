import { AdminAuthProvider } from "@/app/providers/AdminAuthProvider";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
