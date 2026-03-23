export type ApiSuccess<T> = {
    success: true;
    message: string;
    data: T;
};

export type ApiFailure = {
    success: false;
    message: string;
    issues?: string[];
};

export type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

export type ApiResult<T> = {
    status: number;
    body: ApiPayload<T>;
};

export function successResponse<T>(data: T, message = "Success", status = 200): ApiResult<T> {
    return {
        status,
        body: {
            success: true,
            message,
            data,
        },
    };
}

export function errorResponse(message: string, status = 400, issues?: string[]): ApiResult<never> {
    return {
        status,
        body: {
            success: false,
            message,
            ...(issues ? { issues } : {}),
        },
    };
}
