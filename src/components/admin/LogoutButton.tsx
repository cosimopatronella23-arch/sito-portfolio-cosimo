import { signOut } from "@/lib/actions/auth";

export function LogoutButton({
  className = "text-sm text-foreground-muted hover:text-foreground",
  children = "Esci",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={signOut}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
