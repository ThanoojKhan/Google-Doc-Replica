"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    getCurrentUserId,
    setCurrentUserId,
} from "@/lib/currentUser";
import type { UserSummary } from "@/lib/types";

export default function UserSelector() {
    const router = useRouter();
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        async function loadUsers() {
            const response = await fetch("/api/users", { cache: "no-store" });
            const result = (await response.json()) as {
                success: boolean;
                data?: UserSummary[];
            };

            if (!result.success || !result.data) {
                return;
            }

            setUsers(result.data);

            const storedUserId = getCurrentUserId();
            const fallbackUserId = storedUserId ?? result.data[0]?.id ?? "";

            if (fallbackUserId) {
                setCurrentUserId(fallbackUserId);
                setSelectedUserId(fallbackUserId);
            }
        }

        void loadUsers();
    }, []);

    const changeUser = (id: string) => {
        setSelectedUserId(id);
        setCurrentUserId(id);
        startTransition(() => {
            router.push("/documents");
            router.refresh();
        });
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--muted)]">Viewing as</span>
            <select
                value={selectedUserId}
                onChange={(event) => changeUser(event.target.value)}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
            >
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name ?? user.email}
                    </option>
                ))}
            </select>
            {isPending ? <span className="text-xs text-[var(--muted)]">Refreshing...</span> : null}
        </div>
    );
}
