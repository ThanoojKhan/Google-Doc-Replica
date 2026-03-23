import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AccessRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/apiHandler";
import type {
    AccessRole as ClientAccessRole,
    AttachmentSummary,
    DocumentCollections,
    DocumentDetail,
    DocumentListItem,
    SharedUser,
} from "@/lib/types";

type TipTapDocument = {
    type: "doc";
    content: Prisma.InputJsonValue[];
};

const documentInclude = {
    owner: {
        select: {
            id: true,
            email: true,
            name: true,
        },
    },
    access: {
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    },
    attachments: {
        orderBy: {
            uploadedAt: "desc" as const,
        },
    },
} as const;

function serializeRole(role: AccessRole): ClientAccessRole {
    return role;
}

function serializeAttachment(attachment: {
    id: string;
    filename: string;
    path: string;
    uploadedAt: Date;
}): AttachmentSummary {
    return {
        id: attachment.id,
        filename: attachment.filename,
        path: attachment.path,
        uploadedAt: attachment.uploadedAt.toISOString(),
    };
}

function serializeSharedUsers(
    accesses: Array<{
        role: AccessRole;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>,
): SharedUser[] {
    return accesses.map((access) => ({
        id: access.user.id,
        email: access.user.email,
        name: access.user.name,
        role: serializeRole(access.role),
    }));
}

function serializeDocumentListItem(
    document: {
        id: string;
        title: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        owner: {
            email: string;
            name: string | null;
        };
        access: Array<{
            userId: string;
            role: AccessRole;
        }>;
        attachments: Array<{ id: string }>;
    },
    currentUserId: string,
): DocumentListItem {
    const userAccess = document.access.find((access) => access.userId === currentUserId);
    const isOwner = document.ownerId === currentUserId;

    return {
        id: document.id,
        title: document.title,
        ownerId: document.ownerId,
        ownerName: document.owner.name ?? "Unnamed user",
        ownerEmail: document.owner.email,
        updatedAt: document.updatedAt.toISOString(),
        createdAt: document.createdAt.toISOString(),
        role: isOwner ? "owner" : serializeRole(userAccess?.role ?? "viewer"),
        canEdit: isOwner || userAccess?.role === "editor",
        canShare: isOwner,
        attachmentCount: document.attachments.length,
    };
}

function serializeDocumentDetail(
    document: {
        id: string;
        title: string;
        ownerId: string;
        content: unknown;
        createdAt: Date;
        updatedAt: Date;
        owner: {
            email: string;
            name: string | null;
        };
        access: Array<{
            userId: string;
            role: AccessRole;
            user: {
                id: string;
                email: string;
                name: string | null;
            };
        }>;
        attachments: Array<{
            id: string;
            filename: string;
            path: string;
            uploadedAt: Date;
        }>;
    },
    currentUserId: string,
): DocumentDetail {
    return {
        ...serializeDocumentListItem(document, currentUserId),
        content: document.content as Record<string, unknown>,
        attachments: document.attachments.map(serializeAttachment),
        sharedUsers: serializeSharedUsers(
            document.access.filter((access) => access.userId !== document.ownerId),
        ),
    };
}

export function createEmptyDocumentContent(): TipTapDocument {
    return {
        type: "doc",
        content: [],
    };
}

export function createDocumentContentFromText(text: string): TipTapDocument {
    const content = text
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => ({
            type: "paragraph",
            content: [{ type: "text", text: line }],
        }));

    return {
        type: "doc",
        content,
    };
}

export async function createDocument({
    title,
    content,
    ownerId,
}: {
    title: string;
    content?: TipTapDocument;
    ownerId: string;
}) {
    return prisma.document.create({
        data: {
            title,
            content: content ?? createEmptyDocumentContent(),
            ownerId,
        },
    });
}

export async function listAccessibleDocuments(userId: string): Promise<DocumentCollections> {
    const [ownedDocuments, sharedDocuments] = await Promise.all([
        prisma.document.findMany({
            where: {
                ownerId: userId,
            },
            include: documentInclude,
            orderBy: {
                updatedAt: "desc",
            },
        }),
        prisma.document.findMany({
            where: {
                ownerId: {
                    not: userId,
                },
                access: {
                    some: {
                        userId,
                    },
                },
            },
            include: documentInclude,
            orderBy: {
                updatedAt: "desc",
            },
        }),
    ]);

    return {
        ownedDocuments: ownedDocuments.map((document) => serializeDocumentListItem(document, userId)),
        sharedDocuments: sharedDocuments.map((document) => serializeDocumentListItem(document, userId)),
    };
}

export async function getDocumentByIdForUser(id: string, userId: string): Promise<DocumentDetail> {
    const document = await prisma.document.findFirst({
        where: {
            id,
            OR: [
                {
                    ownerId: userId,
                },
                {
                    access: {
                        some: {
                            userId,
                        },
                    },
                },
            ],
        },
        include: documentInclude,
    });

    if (!document) {
        throw new ApiError("Document not found", 404);
    }

    return serializeDocumentDetail(document, userId);
}

export async function updateDocument({
    documentId,
    actorUserId,
    title,
    content,
}: {
    documentId: string;
    actorUserId: string;
    title?: string;
    content?: TipTapDocument;
}) {
    const document = await prisma.document.findFirst({
        where: {
            id: documentId,
            OR: [
                {
                    ownerId: actorUserId,
                },
                {
                    access: {
                        some: {
                            userId: actorUserId,
                        },
                    },
                },
            ],
        },
        include: {
            access: true,
        },
    });

    if (!document) {
        throw new ApiError("Document not found", 404);
    }

    const userAccess = document.access.find((access) => access.userId === actorUserId);
    const canEdit = document.ownerId === actorUserId || userAccess?.role === "editor";

    if (!canEdit) {
        throw new ApiError("You do not have permission to edit this document", 403);
    }

    await prisma.document.update({
        where: {
            id: documentId,
        },
        data: {
            ...(typeof title !== "undefined" ? { title } : {}),
            ...(typeof content !== "undefined" ? { content } : {}),
        },
    });

    return getDocumentByIdForUser(documentId, actorUserId);
}

export async function createDocumentFromUpload({
    ownerId,
    originalFilename,
    fileBuffer,
}: {
    ownerId: string;
    originalFilename: string;
    fileBuffer: Buffer;
}) {
    const uploadDirectory = path.join(process.cwd(), "uploads");
    await mkdir(uploadDirectory, { recursive: true });

    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storedFilename = `${Date.now()}-${sanitizedFilename}`;
    const absolutePath = path.join(uploadDirectory, storedFilename);
    await writeFile(absolutePath, fileBuffer);

    const title = sanitizedFilename.replace(/\.(txt|md)$/i, "").trim() || "Imported document";
    const content = createDocumentContentFromText(fileBuffer.toString("utf8"));

    const document = await prisma.$transaction(async (transaction) => {
        const createdDocument = await transaction.document.create({
            data: {
                title,
                content,
                ownerId,
            },
        });

        await transaction.attachment.create({
            data: {
                documentId: createdDocument.id,
                filename: originalFilename,
                path: `/uploads/${storedFilename}`,
            },
        });

        return createdDocument;
    });

    return getDocumentByIdForUser(document.id, ownerId);
}
