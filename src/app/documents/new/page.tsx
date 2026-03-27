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
            <section className="editorial-card px-5 py-6 sm:px-6">
                <div className="space-y-3">
                    <p className="section-kicker text-[var(--accent)]">
                        New document
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Start a fresh draft with a cleaner desk
                    </h1>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                        Create a blank document or import Markdown or text files into a calmer,
                        more reference-driven workspace.
                    </p>
                </div>
            </section>

            <section className="editorial-card px-5 py-6 sm:px-6">
                <div className="space-y-5">
                    <label className="block space-y-2">
                        <span className="text-sm font-semibold">Document title</span>
                        <input
                            type="text"
                            placeholder="Quarterly planning notes"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="field-shell"
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
                            className="pill-button disabled:cursor-not-allowed disabled:opacity-60"
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
