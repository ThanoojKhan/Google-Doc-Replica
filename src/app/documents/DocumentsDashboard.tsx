"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DocumentList from "@/components/DocumentList";
import FileUpload from "@/components/FileUpload";
import { CURRENT_USER_CHANGED_EVENT } from "@/lib/currentUser";
import type { DocumentCollections } from "@/lib/types";

type DashboardProps = {
    initialFilter?: "all" | "shared";
};

const emptyCollections: DocumentCollections = {
    ownedDocuments: [],
    sharedDocuments: [],
};

export default function DocumentsDashboard({ initialFilter = "all" }: DashboardProps) {
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentCollections>(emptyCollections);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/documents", { cache: "no-store" });
            const result = (await response.json()) as {
                success: boolean;
                message: string;
                data?: DocumentCollections;
            };

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Unable to load documents");
            }

            setDocuments(result.data);
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : "Unable to load documents");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    useEffect(() => {
        const handleCurrentUserChanged = () => {
            void loadDocuments();
        };

        window.addEventListener(CURRENT_USER_CHANGED_EVENT, handleCurrentUserChanged);

        return () => {
            window.removeEventListener(CURRENT_USER_CHANGED_EVENT, handleCurrentUserChanged);
        };
    }, [loadDocuments]);

    const renameDocument = useCallback(
        async (documentId: string, currentTitle: string) => {
            const nextTitle = window.prompt("Rename document", currentTitle)?.trim();

            if (!nextTitle || nextTitle === currentTitle) {
                return;
            }

            const response = await fetch(`/api/documents/${documentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: nextTitle,
                }),
            });

            const result = (await response.json()) as { success: boolean; message: string };

            if (!response.ok || !result.success) {
                window.alert(result.message || "Unable to rename document");
                return;
            }

            startTransition(() => {
                void loadDocuments();
            });
        },
        [loadDocuments],
    );

    return (
        <div className="space-y-6">
            <section className="editorial-card px-5 py-5 sm:px-6 sm:py-6">
                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
                    <div className="space-y-4">
                        <p className="section-kicker text-[var(--accent)]">Workspace pulse</p>
                        <div className="space-y-3">
                            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                                {initialFilter === "shared"
                                    ? "Shared documents arranged like a reading desk"
                                    : "A quieter document dashboard with editorial structure"}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                                Browse what you own, jump into shared work and start new drafts in
                                a layout shaped more by publishing and archives than AI product pages.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/documents/new" className="pill-button">
                                New Document
                            </Link>
                            <FileUpload onUploaded={(documentId) => router.push(`/documents/${documentId}`)} />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                                Owned
                            </p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                {documents.ownedDocuments.length}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">Editable by you</p>
                        </div>
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                                Shared
                            </p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                {documents.sharedDocuments.length}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">Incoming from teammates</p>
                        </div>
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                                Filter
                            </p>
                            <p className="mt-2 text-lg font-semibold tracking-tight">
                                {initialFilter === "shared" ? "Shared only" : "All activity"}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">Switch views from the header</p>
                        </div>
                    </div>
                </div>
            </section>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            ) : null}

            {isLoading ? (
                <div className="editorial-card px-5 py-10 text-center text-sm text-[var(--muted)]">
                    Loading documents...
                </div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    {initialFilter !== "shared" ? (
                        <DocumentList
                            title="Owned Documents"
                            description="Documents you can edit, rename, and share."
                            documents={documents.ownedDocuments}
                            emptyState="Create your first document or import a text file to get started."
                            onRename={renameDocument}
                            onShared={() => startTransition(() => void loadDocuments())}
                        />
                    ) : null}

                    <DocumentList
                        title="Shared With Me"
                        description="Documents other users have granted you access to."
                        documents={documents.sharedDocuments}
                        emptyState="No shared documents yet."
                        onShared={() => startTransition(() => void loadDocuments())}
                    />
                </div>
            )}

            {isPending ? <p className="text-sm text-[var(--muted)]">Refreshing document list...</p> : null}
        </div>
    );
}
