import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ApiError, apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/apiResponse";
import { CURRENT_USER_COOKIE } from "@/lib/currentUser";
import {
    getDocumentByIdForUser,
    updateDocument,
} from "@/lib/services/documentService";
import { documentIdParamSchema, updateDocumentSchema } from "@/lib/validators";

async function requireCurrentUserId() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;

    if (!userId) {
        throw new ApiError("Select a user before continuing", 401);
    }

    return userId;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    return apiHandler(async () => {
        const userId = await requireCurrentUserId();
        const { id } = documentIdParamSchema.parse(await params);
        const document = await getDocumentByIdForUser(id, userId);

        return successResponse(document);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    return apiHandler(async () => {
        const userId = await requireCurrentUserId();
        const { id } = documentIdParamSchema.parse(await params);
        const payload = updateDocumentSchema.parse(await request.json());

        const document = await updateDocument({
            documentId: id,
            actorUserId: userId,
            title: payload.title,
            content: payload.content,
        });

        return successResponse(document, "Document updated");
    });
}
