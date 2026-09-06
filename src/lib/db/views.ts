import { createAdminClient } from "@/lib/supabase-admin";

const supabase = createAdminClient();

export async function recordView(viewerId: string, viewedId: string) {
  if (viewerId === viewedId) return;

  const { data: existing } = await supabase
    .from("ProfileView")
    .select("id")
    .eq("viewer_id", viewerId)
    .eq("viewed_id", viewedId)
    .single();

  if (existing) return;

  await supabase.from("ProfileView").insert({
    viewer_id: viewerId,
    viewed_id: viewedId,
  });
}

export async function getViewsCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("ProfileView")
    .select("id", { count: "exact", head: true })
    .eq("viewed_id", userId);

  return count ?? 0;
}

export async function getViewersList(userId: string) {
  const { data: views } = await supabase
    .from("ProfileView")
    .select(`
      id, created_at,
      viewer:Profile!ProfileView_viewer_id_fkey(
        id, name, age, gender, location, photos,
        ai_archetype, spiritual_community, tier
      )
    `)
    .eq("viewed_id", userId)
    .order("created_at", { ascending: false });

  return (views ?? []).map((v: any) => v.viewer);
}
