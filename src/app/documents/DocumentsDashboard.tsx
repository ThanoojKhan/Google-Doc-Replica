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
            <section className="surface rounded-[28px] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">
                            Workspace
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {initialFilter === "shared" ? "Shared documents" : "Document dashboard"}
                        </h1>
                        <p className="max-w-2xl text-sm text-[var(--muted)]">
                            Keep the product slice focused: create documents, edit rich text, import
                            files, and manage sharing through a clean service-driven architecture.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <FileUpload onUploaded={(documentId) => router.push(`/documents/${documentId}`)} />
                        <Link
                            href="/documents/new"
                            className="rounded-full bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                        >
                            New Document
                        </Link>
                    </div>
                </div>
            </section>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            ) : null}

            {isLoading ? (
                <div className="surface rounded-[28px] px-5 py-10 text-center text-sm text-[var(--muted)]">
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
