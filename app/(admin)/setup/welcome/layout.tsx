// This page renders its own full-page layout (no sidebar),
// so we bypass the setup layout by overriding it here.
export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
