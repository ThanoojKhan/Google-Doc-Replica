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
        <div className="w-full max-w-md rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="section-kicker text-[var(--muted)]">Viewing as</span>
                {isPending ? <span className="text-xs text-[var(--muted)]">Refreshing...</span> : null}
            </div>
            <select
                value={selectedUserId}
                onChange={(event) => changeUser(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            >
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name ?? user.email}
                    </option>
                ))}
            </select>
        </div>
    );
}
