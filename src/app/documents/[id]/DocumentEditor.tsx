"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import FileUpload from "@/components/FileUpload";
import ShareDialog from "@/components/ShareDialog";
import type { DocumentDetail } from "@/lib/types";

type DocumentEditorProps = {
    documentId: string;
};

const emptyContent = {
    type: "doc",
    content: [],
};

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
    const router = useRouter();
    const [document, setDocument] = useState<DocumentDetail | null>(null);
    const [title, setTitle] = useState("");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, startTransition] = useTransition();
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingPatchRef = useRef<Record<string, unknown>>({});

    const loadDocument = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/documents/${documentId}`, { cache: "no-store" });
            const result = (await response.json()) as {
                success: boolean;
                message: string;
                data?: DocumentDetail;
            };

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Unable to load document");
            }

            setDocument(result.data);
            setTitle(result.data.title);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load document");
        } finally {
            setIsLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        void loadDocument();
    }, [loadDocument]);

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    const flushSave = useCallback(async () => {
        const patch = pendingPatchRef.current;
        pendingPatchRef.current = {};

        if (Object.keys(patch).length === 0) {
            return;
        }

        setSaveState("saving");

        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patch),
            });

            const result = (await response.json()) as {
                success: boolean;
                message: string;
                data?: DocumentDetail;
            };

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Autosave failed");
            }

            setDocument(result.data);
            setTitle(result.data.title);
            setSaveState("saved");
            setError(null);
        } catch (saveError) {
            setSaveState("error");
            setError(saveError instanceof Error ? saveError.message : "Autosave failed");
        }
    }, [documentId]);

    const scheduleSave = useCallback(
        (patch: Record<string, unknown>) => {
            pendingPatchRef.current = {
                ...pendingPatchRef.current,
                ...patch,
            };

            setSaveState("idle");

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(() => {
                void flushSave();
            }, 2000);
        },
        [flushSave],
    );

    const handleContentChange = useCallback(
        (content: Record<string, unknown>) => {
            if (!document?.canEdit) {
                return;
            }

            setDocument((currentDocument) =>
                currentDocument
                    ? {
                          ...currentDocument,
                          content,
                      }
                    : currentDocument,
            );

            scheduleSave({ content });
        },
        [document?.canEdit, scheduleSave],
    );

    const handleTitleBlur = useCallback(() => {
        if (!document?.canEdit) {
            return;
        }

        const nextTitle = title.trim();

        if (!nextTitle) {
            setTitle(document.title);
            return;
        }

        if (nextTitle === document.title) {
            return;
        }

        setDocument((currentDocument) =>
            currentDocument
                ? {
                      ...currentDocument,
                      title: nextTitle,
                  }
                : currentDocument,
        );

        scheduleSave({ title: nextTitle });
    }, [document, scheduleSave, title]);

    if (isLoading) {
        return (
            <div className="surface rounded-4xl px-5 py-12 text-center text-sm text-[var(--muted)]">
                Loading document...
            </div>
        );
    }

    if (!document) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-[var(--danger)]">
                {error ?? "Document not found"}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="editorial-card px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="status-chip status-chip--soft">
                                {document.role === "owner" ? "Owner" : document.role}
                            </span>
                            <span className="text-sm text-[var(--muted)]">
                                {document.canEdit ? "Editable" : "Read only"} for this user
                            </span>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                onBlur={handleTitleBlur}
                                disabled={!document.canEdit}
                                className="field-shell text-3xl font-semibold tracking-tight disabled:cursor-not-allowed disabled:bg-white/70"
                            />

                            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                                <span>
                                    Owner: {document.ownerName} ({document.ownerEmail})
                                </span>
                                <span>Updated {new Date(document.updatedAt).toLocaleString()}</span>
                                <span>
                                    Status:{" "}
                                    {saveState === "saving"
                                        ? "Saving..."
                                        : saveState === "saved"
                                          ? "Saved"
                                          : saveState === "error"
                                            ? "Needs attention"
                                            : "Waiting for changes"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 xl:w-[320px]">
                        {document.canShare ? (
                            <ShareDialog
                                documentId={document.id}
                                sharedUsers={document.sharedUsers}
                                onShared={() =>
                                    startTransition(() => {
                                        void loadDocument();
                                    })
                                }
                            />
                        ) : null}

                        <FileUpload onUploaded={(newDocumentId) => router.push(`/documents/${newDocumentId}`)} />

                        {document.attachments.length > 0 ? (
                            <div className="surface-strong rounded-3xl px-4 py-3">
                                <p className="text-sm font-medium">Imported files</p>
                                <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                                    {document.attachments.map((attachment) => (
                                        <li key={attachment.id}>
                                            {attachment.filename} -{" "}
                                            {new Date(attachment.uploadedAt).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
                    {error}
                </div>
            ) : null}

            <section className="editorial-card p-3 sm:p-4">
                <Editor
                    content={
                        typeof document.content === "object" && document.content
                            ? document.content
                            : emptyContent
                    }
                    editable={document.canEdit}
                    onChange={handleContentChange}
                />
            </section>

            {isRefreshing ? (
                <p className="text-sm text-[var(--muted)]">Refreshing sharing details...</p>
            ) : null}
        </div>
    );
}
