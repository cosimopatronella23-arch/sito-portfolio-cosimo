"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signIn, {
    error: null,
  });

  return (
    <div className="container-px flex min-h-screen items-center justify-center">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Accedi
        </h1>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="La tua email"
            className="w-full border-0 border-b border-border-strong bg-transparent py-3 text-lg text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full border-0 border-b border-border-strong bg-transparent py-3 text-lg text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-error">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
