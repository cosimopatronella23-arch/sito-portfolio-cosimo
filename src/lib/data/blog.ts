import { createPublicClient } from "@/lib/supabase/publicClient";
import { createClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/withRetry";
import type { BlogPost } from "@/lib/types";

export async function getPublishedPosts(): Promise<BlogPost[]> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data;
  });
}

/** Per /admin: vede anche le bozze, richiede la sessione dell'utente loggato. */
export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPostByIdAdmin(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
