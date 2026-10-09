import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostByIdAdmin } from "@/lib/data/blog";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;
  const { salvato } = await props.searchParams;
  const post = await getPostByIdAdmin(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/blog"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Blog
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
        {post.title}
      </h1>
      <PostForm post={post} created={salvato === "1"} />
    </div>
  );
}
