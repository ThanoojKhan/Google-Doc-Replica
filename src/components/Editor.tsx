"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";

type EditorProps = {
    content: Record<string, unknown>;
    editable?: boolean;
    onChange: (content: Record<string, unknown>) => void;
};

const emptyDocumentContent: Record<string, unknown> = {
    type: "doc",
    content: [],
};

function ToolbarButton({
    label,
    onClick,
    isActive = false,
    disabled = false,
}: {
    label: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
                isActive
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--text)] hover:border-[var(--accent)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
        >
            {label}
        </button>
    );
}

export default function Editor({ content, editable = true, onChange }: EditorProps) {
    const safeContent =
        content && content.type === "doc"
            ? content
            : emptyDocumentContent;

    const editor = useEditor({
        immediatelyRender: false,
        editable,
        content: safeContent,
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
                heading: false,
                bulletList: false,
                orderedList: false,
            }),
            Bold,
            Italic,
            Underline,
            BulletList,
            OrderedList,
            Heading.configure({
                levels: [1, 2, 3],
            }),
        ],
        editorProps: {
            attributes: {
                class: "prose-editor rounded-[24px] bg-white px-5 py-5 focus:outline-none",
            },
        },
        onUpdate({ editor: nextEditor }) {
            if (editable) {
                onChange(nextEditor.getJSON() as Record<string, unknown>);
            }
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(editable);
    }, [editable, editor]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentContent = editor.getJSON();
        const hasChanged =
            JSON.stringify(currentContent.content ?? []) !==
                JSON.stringify((safeContent.content as unknown[]) ?? []) ||
            currentContent.type !== safeContent.type;

        if (hasChanged) {
            editor.commands.setContent(safeContent, { emitUpdate: false });
        }
    }, [editor, safeContent]);

    if (!editor) {
        return <div className="px-4 py-8 text-sm text-[var(--muted)]">Loading editor...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] px-1 pb-3">
                <ToolbarButton
                    label="Bold"
                    disabled={!editable}
                    isActive={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <ToolbarButton
                    label="Italic"
                    disabled={!editable}
                    isActive={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <ToolbarButton
                    label="Underline"
                    disabled={!editable}
                    isActive={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                />
                <ToolbarButton
                    label="H1"
                    disabled={!editable}
                    isActive={editor.isActive("heading", { level: 1 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                />
                <ToolbarButton
                    label="H2"
                    disabled={!editable}
                    isActive={editor.isActive("heading", { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                />
                <ToolbarButton
                    label="Bullets"
                    disabled={!editable}
                    isActive={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
                <ToolbarButton
                    label="Numbered"
                    disabled={!editable}
                    isActive={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
