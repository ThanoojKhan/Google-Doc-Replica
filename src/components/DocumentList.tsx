"use client";

import Link from "next/link";
import ShareDialog from "@/components/ShareDialog";
import type { DocumentListItem } from "@/lib/types";

type DocumentListProps = {
    title: string;
    description: string;
    documents: DocumentListItem[];
    emptyState: string;
    onRename?: (documentId: string, currentTitle: string) => void | Promise<void>;
    onShared?: () => void;
};

function RoleBadge({ role }: { role: DocumentListItem["role"] }) {
    const label = role === "owner" ? "Owner" : role === "editor" ? "Editor" : "Viewer";

    return (
        <span className="status-chip status-chip--soft">
            {label}
        </span>
    );
}

export default function DocumentList({
    title,
    description,
    documents,
    emptyState,
    onRename,
    onShared,
}: DocumentListProps) {
    return (
        <section className="editorial-card px-5 py-5 sm:px-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                <p className="text-sm text-[var(--muted)]">{description}</p>
            </div>

            {documents.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
                    {emptyState}
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {documents.map((document) => (
                        <article
                            key={document.id}
                            className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-soft)]"
                        >
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <RoleBadge role={document.role} />
                                        {document.attachmentCount > 0 ? (
                                            <span className="status-chip bg-[#ece2d6] text-[#8a5b32]">
                                                {document.attachmentCount} attachment
                                                {document.attachmentCount === 1 ? "" : "s"}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Link
                                            href={`/documents/${document.id}`}
                                            className="text-xl font-semibold tracking-tight transition hover:text-[var(--accent)]"
                                        >
                                            {document.title}
                                        </Link>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            Owner: {document.ownerName} ({document.ownerEmail})
                                        </p>
                                    </div>

                                    <p className="text-sm text-[var(--muted)]">
                                        Updated {new Date(document.updatedAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex w-full flex-col gap-3 xl:w-[280px]">
                                    <Link
                                        href={`/documents/${document.id}`}
                                        className="secondary-button"
                                    >
                                        Open
                                    </Link>

                                    {onRename && document.canEdit ? (
                                        <button
                                            type="button"
                                            onClick={() => void onRename(document.id, document.title)}
                                            className="secondary-button"
                                        >
                                            Rename
                                        </button>
                                    ) : null}

                                    {document.canShare ? (
                                        <ShareDialog documentId={document.id} onShared={onShared} />
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
