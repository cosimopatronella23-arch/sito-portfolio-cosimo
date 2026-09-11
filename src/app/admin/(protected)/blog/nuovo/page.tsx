import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo articolo
      </h1>
      <PostForm />
    </div>
  );
}
