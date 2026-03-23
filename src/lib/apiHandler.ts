import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { errorResponse, type ApiResult } from "@/lib/apiResponse";

export class ApiError extends Error {
    statusCode: number;
    issues?: string[];

    constructor(message: string, statusCode = 400, issues?: string[]) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.issues = issues;
    }
}

export async function apiHandler<T>(fn: () => Promise<ApiResult<T>> | ApiResult<T>) {
    try {
        const result = await fn();
        return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
        if (error instanceof ApiError) {
            const result = errorResponse(error.message, error.statusCode, error.issues);
            return NextResponse.json(result.body, { status: result.status });
        }

        if (error instanceof ZodError) {
            const result = errorResponse(
                "Validation failed",
                400,
                error.issues.map((issue) => issue.message),
            );
            return NextResponse.json(result.body, { status: result.status });
        }

        if (error instanceof Prisma.PrismaClientInitializationError) {
            const result = errorResponse(
                "Database connection failed. Check DATABASE_URL and make sure PostgreSQL is running.",
                503,
            );
            return NextResponse.json(result.body, { status: result.status });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const result = errorResponse(`Database request failed: ${error.message}`, 500);
            return NextResponse.json(result.body, { status: result.status });
        }

        console.error(error);
        const result = errorResponse("Internal server error", 500);
        return NextResponse.json(result.body, { status: result.status });
    }
}
