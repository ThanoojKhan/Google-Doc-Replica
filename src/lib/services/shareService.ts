import "server-only";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/apiHandler";
import type { AccessRole } from "@/lib/types";

export async function shareDocument({
    documentId,
    ownerId,
    email,
    role,
}: {
    documentId: string;
    ownerId: string;
    email: string;
    role: AccessRole;
}) {
    const document = await prisma.document.findUnique({
        where: {
            id: documentId,
        },
    });

    if (!document) {
        throw new ApiError("Document not found", 404);
    }

    if (document.ownerId !== ownerId) {
        throw new ApiError("Only the owner can share this document", 403);
    }

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new ApiError("Cannot share with an unknown user", 404);
    }

    if (user.id === ownerId) {
        throw new ApiError("The owner already has access to this document");
    }

    return prisma.documentAccess.upsert({
        where: {
            documentId_userId: {
                documentId,
                userId: user.id,
            },
        },
        update: {
            role,
        },
        create: {
            documentId,
            userId: user.id,
            role,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
}
