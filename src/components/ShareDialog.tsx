"use client";

import { useState } from "react";
import type { SharedUser } from "@/lib/types";

type ShareDialogProps = {
    documentId: string;
    sharedUsers?: SharedUser[];
    onShared?: () => void;
};

export default function ShareDialog({
    documentId,
    sharedUsers = [],
    onShared,
}: ShareDialogProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"viewer" | "editor">("viewer");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShare = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/share", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId,
                    email,
                    role,
                }),
            });

            const result = (await response.json()) as { success: boolean; message: string };

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to share document");
            }

            setEmail("");
            onShared?.();
            setIsOpen(true);
        } catch (shareError) {
            setError(shareError instanceof Error ? shareError.message : "Unable to share document");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="surface-strong rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Share document</p>
                    <p className="text-xs text-[var(--muted)]">
                        Invite by seeded user email with viewer or editor access.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen((current) => !current)}
                    className="secondary-button px-3 py-1"
                >
                    {isOpen ? "Hide" : "Open"}
                </button>
            </div>

            {isOpen ? (
                <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="user2@example.com"
                            className="field-shell"
                        />
                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value as "viewer" | "editor")}
                            className="field-shell"
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleShare}
                            disabled={isSubmitting}
                            className="pill-button w-full disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Sharing..." : "Share"}
                        </button>
                    </div>

                    {error ? (
                        <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    ) : null}

                    <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                            Current access
                        </p>
                        {sharedUsers.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">No shared users yet.</p>
                        ) : (
                            <ul className="space-y-2 text-sm text-[var(--muted)]">
                                {sharedUsers.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between gap-3">
                                        <span>
                                            {user.name ?? user.email} ({user.email})
                                        </span>
                                        <span className="status-chip status-chip--soft">
                                            {user.role}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
