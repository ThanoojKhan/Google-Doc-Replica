export type AccessRole = "viewer" | "editor";

export interface UserSummary {
    id: string;
    email: string;
    name: string | null;
}

export interface AttachmentSummary {
    id: string;
    filename: string;
    path: string;
    uploadedAt: string;
}

export interface SharedUser {
    id: string;
    email: string;
    name: string | null;
    role: AccessRole;
}

export interface DocumentListItem {
    id: string;
    title: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    updatedAt: string;
    createdAt: string;
    role: "owner" | AccessRole;
    canEdit: boolean;
    canShare: boolean;
    attachmentCount: number;
}

export interface DocumentCollections {
    ownedDocuments: DocumentListItem[];
    sharedDocuments: DocumentListItem[];
}

export interface DocumentDetail extends DocumentListItem {
    content: Record<string, unknown>;
    attachments: AttachmentSummary[];
    sharedUsers: SharedUser[];
}
