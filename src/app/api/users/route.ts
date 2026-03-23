import { apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/apiResponse";
import { listUsers } from "@/lib/services/userService";

export async function GET() {
    return apiHandler(async () => {
        const users = await listUsers();
        return successResponse(users);
    });
}
