import { AdminShell } from "@/components/admin/AdminShell";
import { countUnreadMessages } from "@/lib/data/messages";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadMessages = await countUnreadMessages();
  return <AdminShell unreadMessages={unreadMessages}>{children}</AdminShell>;
}
