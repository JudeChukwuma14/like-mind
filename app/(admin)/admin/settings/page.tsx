import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "System Settings | Admin",
  description: "Configure global Kajola platform settings.",
};

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
