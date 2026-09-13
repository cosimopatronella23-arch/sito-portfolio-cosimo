import type { Metadata } from "next";

// robots.txt disallow "/admin" impedisce la scansione, ma non basta a
// impedire l'indicizzazione se un link esterno punta qui: il meta noindex
// è la protezione che conta davvero.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
