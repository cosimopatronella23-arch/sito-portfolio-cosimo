import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/blog"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Blog
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo articolo
      </h1>
      <PostForm />
    </div>
  );
}
