"use client";

export function DeleteButton({ label = "Elimina" }: { label?: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (
          !window.confirm("Eliminare definitivamente? Non si può annullare.")
        ) {
          e.preventDefault();
        }
      }}
      className="text-sm text-foreground-muted hover:text-error"
    >
      {label}
    </button>
  );
}
