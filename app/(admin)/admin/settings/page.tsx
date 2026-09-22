import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "System Settings | Admin",
  description: "Review the admin account and configure live approval-tier rules.",
};

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
