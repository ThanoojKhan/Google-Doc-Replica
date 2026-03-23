"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";


export default function NewDocumentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createDocument = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                }),
            });

            const result = (await response.json()) as {
                success: boolean;
                message: string;
                data?: { id: string };
            };

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Unable to create document");
            }

            router.push(`/documents/${result.data.id}`);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to create document");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="surface rounded-[28px] px-5 py-6 sm:px-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">
                        New document
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">Start a fresh draft</h1>
                    <p className="text-sm text-[var(--muted)]">
                        Keep it lightweight: create an empty document or import a supported text file
                        to bootstrap the editor with content.
                    </p>
                </div>
            </section>

            <section className="surface rounded-[28px] px-5 py-6 sm:px-6">
                <div className="space-y-5">
                    <label className="block space-y-2">
                        <span className="text-sm font-medium">Document title</span>
                        <input
                            type="text"
                            placeholder="Quarterly planning notes"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                    </label>

                    {error ? (
                        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={createDocument}
                            disabled={isSubmitting}
                            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating..." : "Create document"}
                        </button>

                        <FileUpload onUploaded={(documentId) => router.push(`/documents/${documentId}`)} />
                    </div>
                </div>
            </section>
        </div>
    );
}
