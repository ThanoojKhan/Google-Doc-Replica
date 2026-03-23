import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ApiError, apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/apiResponse";
import { CURRENT_USER_COOKIE } from "@/lib/currentUser";
import {
    createDocument,
    createEmptyDocumentContent,
    listAccessibleDocuments,
} from "@/lib/services/documentService";
import { createDocumentSchema } from "@/lib/validators";

async function requireCurrentUserId() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;

    if (!userId) {
        throw new ApiError("Select a user before continuing", 401);
    }

    return userId;
}

export async function GET() {
    return apiHandler(async () => {
        const userId = await requireCurrentUserId();
        const documents = await listAccessibleDocuments(userId);

        return successResponse(documents);
    });
}

export async function POST(request: NextRequest) {
    return apiHandler(async () => {
        const userId = await requireCurrentUserId();
        const payload = createDocumentSchema.parse(await request.json());

        const document = await createDocument({
            title: payload.title,
            content: payload.content ?? createEmptyDocumentContent(),
            ownerId: userId,
        });

        return successResponse(document, "Document created", 201);
    });
}
