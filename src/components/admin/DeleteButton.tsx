"use client";

export function DeleteButton({
  label = "Elimina",
  confirmText = "Spostare nel cestino? Potrai recuperarlo dal Cestino per 30 giorni.",
}: {
  label?: string;
  confirmText?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
      className="text-sm text-foreground-muted hover:text-error"
    >
      {label}
    </button>
  );
}
