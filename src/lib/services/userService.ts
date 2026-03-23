import "server-only";
import { prisma } from "@/lib/db";
import type { UserSummary } from "@/lib/types";

export async function listUsers(): Promise<UserSummary[]> {
    return prisma.user.findMany({
        orderBy: {
            email: "asc",
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
}
