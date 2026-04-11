"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function exportAllLeadsAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  const allLeads = await prisma.lead.findMany({
    include: {
      origin: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return allLeads;
}
