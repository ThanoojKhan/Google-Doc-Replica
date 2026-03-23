export const CURRENT_USER_COOKIE = "currentUser";
export const CURRENT_USER_CHANGED_EVENT = "current-user-changed";

export function getCurrentUserId() {
    if (typeof window === "undefined") {
        return null;
    }

    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${CURRENT_USER_COOKIE}=`));

    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setCurrentUserId(id: string) {
    document.cookie = `${CURRENT_USER_COOKIE}=${encodeURIComponent(id)}; path=/; SameSite=Lax`;

    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent(CURRENT_USER_CHANGED_EVENT, {
                detail: {
                    userId: id,
                },
            }),
        );
    }
}
