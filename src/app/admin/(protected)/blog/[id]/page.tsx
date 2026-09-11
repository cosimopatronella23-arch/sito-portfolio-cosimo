import { notFound } from "next/navigation";
import { getPostByIdAdmin } from "@/lib/data/blog";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;
  const post = await getPostByIdAdmin(id);
  if (!post) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {post.title}
      </h1>
      <PostForm post={post} />
    </div>
  );
}
