import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ApiError, apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/apiResponse";
import { CURRENT_USER_COOKIE } from "@/lib/currentUser";
import { shareDocument } from "@/lib/services/shareService";
import { shareDocumentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
    return apiHandler(async () => {
        const cookieStore = await cookies();
        const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;

        if (!userId) {
            throw new ApiError("Select a user before continuing", 401);
        }

        const payload = shareDocumentSchema.parse(await request.json());
        const access = await shareDocument({
            documentId: payload.documentId,
            ownerId: userId,
            email: payload.email,
            role: payload.role,
        });

        return successResponse(access, "Document shared");
    });
}
