"use client";

import { useId, useRef, useState } from "react";

type FileUploadProps = {
    onUploaded?: (documentId: string) => void;
};

export default function FileUpload({ onUploaded }: FileUploadProps) {
    const inputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = (await response.json()) as {
                success: boolean;
                message: string;
                data?: { id: string };
            };

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || "Upload failed");
            }

            onUploaded?.(result.data.id);
        } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
        } finally {
            setIsUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept=".txt,.md"
                onChange={handleUpload}
                className="hidden"
            />

            <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
                {isUploading ? "Uploading..." : "Import .txt or .md"}
            </label>

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        </div>
    );
}
