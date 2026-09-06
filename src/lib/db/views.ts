import { prisma } from "@/lib/prisma";

export async function recordView(viewerId: string, viewedId: string) {
  if (viewerId === viewedId) return;

  const existing = await prisma.profileView.findUnique({
    where: { viewer_id_viewed_id: { viewer_id: viewerId, viewed_id: viewedId } },
  });
  if (existing) return;

  await prisma.profileView.create({
    data: { viewer_id: viewerId, viewed_id: viewedId },
  });
}

export async function getViewsCount(userId: string): Promise<number> {
  return prisma.profileView.count({
    where: { viewed_id: userId },
  });
}

export async function getViewersList(userId: string) {
  const views = await prisma.profileView.findMany({
    where: { viewed_id: userId },
    include: {
      viewer: {
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          location: true,
          photos: true,
          ai_archetype: true,
          spiritual_community: true,
          tier: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return views.map((v) => v.viewer);
}
