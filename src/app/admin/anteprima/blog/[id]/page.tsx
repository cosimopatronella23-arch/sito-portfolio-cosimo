import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { getPostByIdAdmin } from "@/lib/data/blog";

// Sempre la versione appena salvata, mai una copia in cache.
export const dynamic = "force-dynamic";

/** Anteprima di un articolo (anche in bozza), solo per l'amministratore. */
export default async function PostPreviewPage(
  props: PageProps<"/admin/anteprima/blog/[id]">,
) {
  const { id } = await props.params;
  const post = await getPostByIdAdmin(id);
  if (!post) notFound();

  return (
    <PreviewFrame
      published={post.status === "published"}
      editHref={`/admin/blog/${post.id}`}
    >
      <BlogPostView post={post} />
    </PreviewFrame>
  );
}
