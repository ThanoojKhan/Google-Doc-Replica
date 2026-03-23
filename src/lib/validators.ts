import { z } from "zod";

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = [".txt", ".md"] as const;

export const accessRoleSchema = z.enum(["viewer", "editor"]);

export const documentTitleSchema = z
    .string()
    .trim()
    .min(1, "Document title is required")
    .max(120, "Document title must be 120 characters or fewer");

export const tiptapDocumentSchema = z
    .object({
        type: z.literal("doc"),
        content: z.array(z.any()).default([]),
    })
    .passthrough();

export const createDocumentSchema = z.object({
    title: documentTitleSchema,
    content: tiptapDocumentSchema.optional(),
});

export const updateDocumentSchema = z
    .object({
        title: documentTitleSchema.optional(),
        content: tiptapDocumentSchema.optional(),
    })
    .refine(
        (value) => typeof value.title !== "undefined" || typeof value.content !== "undefined",
        "Provide a title or content update",
    );

export const documentIdParamSchema = z.object({
    id: z.uuid("Document id must be a valid UUID"),
});

export const shareDocumentSchema = z.object({
    documentId: z.uuid("Document id must be a valid UUID"),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    role: accessRoleSchema.default("viewer"),
});

export function validateUploadFile(file: File | null) {
    if (!file) {
        throw new Error("A file is required");
    }

    if (file.size === 0) {
        throw new Error("Uploaded file is empty");
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error("File size must be 2MB or less");
    }

    const lowerName = file.name.toLowerCase();
    const isAllowed = ALLOWED_UPLOAD_EXTENSIONS.some((extension) => lowerName.endsWith(extension));

    if (!isAllowed) {
        throw new Error("Only .txt and .md files are allowed");
    }
}
