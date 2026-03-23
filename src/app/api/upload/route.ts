import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ApiError, apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/apiResponse";
import { CURRENT_USER_COOKIE } from "@/lib/currentUser";
import { createDocumentFromUpload } from "@/lib/services/documentService";
import { validateUploadFile } from "@/lib/validators";

export async function POST(request: NextRequest) {
    return apiHandler(async () => {
        const cookieStore = await cookies();
        const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;

        if (!userId) {
            throw new ApiError("Select a user before continuing", 401);
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            throw new ApiError("A file is required");
        }

        try {
            validateUploadFile(file);
        } catch (error) {
            throw new ApiError(
                error instanceof Error ? error.message : "Invalid file upload",
            );
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const document = await createDocumentFromUpload({
            ownerId: userId,
            originalFilename: file.name,
            fileBuffer,
        });

        return successResponse(document, "Document created from file", 201);
    });
}
