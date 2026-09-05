import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Kajola profile and personal information.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
