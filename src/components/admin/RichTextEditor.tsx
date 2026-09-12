"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import clsx from "clsx";

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        "border border-border-strong px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-foreground-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Editor di testo formattato (Tiptap). Il contenuto (HTML) finisce in un
 * input nascosto con il `name` passato, così arriva alla Server Action come
 * un campo normale del form.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  onChange,
}: {
  name: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TiptapImage,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[200px] px-4 py-3 text-foreground focus:outline-none",
      },
    },
  });

  const [html, setHtml] = useState(defaultValue);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const nextHtml = editor.getHTML();
      setHtml(nextHtml);
      onChange?.(nextHtml);
    };
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor, onChange]);

  if (!editor) {
    return (
      <div className="min-h-[240px] border border-border-strong bg-surface" />
    );
  }

  return (
    <div className="border border-border-strong bg-surface">
      <div className="flex flex-wrap gap-2 border-b border-border-strong p-2">
        <ToolbarButton
          label="Grassetto"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          label="Corsivo"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          label="Titolo"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Elenco puntato"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("URL del link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          label="Immagine"
          onClick={() => {
            const url = window.prompt("URL dell'immagine:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Immagine
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
