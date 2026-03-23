import { prisma } from "@/lib/db";
import {
    createDocument,
    createEmptyDocumentContent,
} from "@/lib/services/documentService";

jest.mock("@/lib/db", () => ({
    prisma: {
        document: {
            create: jest.fn(),
        },
    },
}));

describe("documentService.createDocument", () => {
    it("saves a document with the owner and title", async () => {
        const mockDocument = {
            id: "document-1",
            title: "Test Document",
            content: createEmptyDocumentContent(),
            ownerId: "user-1",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        (prisma.document.create as jest.Mock).mockResolvedValue(mockDocument);

        const result = await createDocument({
            title: "Test Document",
            ownerId: "user-1",
            content: createEmptyDocumentContent(),
        });

        expect(prisma.document.create).toHaveBeenCalledWith({
            data: {
                title: "Test Document",
                content: createEmptyDocumentContent(),
                ownerId: "user-1",
            },
        });

        expect(result).toEqual(mockDocument);
    });
});
