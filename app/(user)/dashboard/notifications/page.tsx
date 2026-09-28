import type { Metadata } from "next";
import { NotificationsClient } from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Manage your Kajola notifications.",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
