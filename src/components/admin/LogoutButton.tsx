import { signOut } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-foreground-muted hover:text-foreground"
      >
        Esci
      </button>
    </form>
  );
}
