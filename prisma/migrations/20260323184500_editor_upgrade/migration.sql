-- CreateEnum
CREATE TYPE "AccessRole" AS ENUM ('viewer', 'editor');

-- AlterTable
ALTER TABLE "DocumentAccess" ADD COLUMN     "role_new" "AccessRole";

UPDATE "DocumentAccess"
SET "role_new" = CASE
    WHEN LOWER("role") = 'editor' THEN 'editor'::"AccessRole"
    ELSE 'viewer'::"AccessRole"
END;

ALTER TABLE "DocumentAccess" ALTER COLUMN "role_new" SET NOT NULL;
ALTER TABLE "DocumentAccess" DROP COLUMN "role";
ALTER TABLE "DocumentAccess" RENAME COLUMN "role_new" TO "role";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Document_ownerId_updatedAt_idx" ON "Document"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "DocumentAccess_userId_documentId_idx" ON "DocumentAccess"("userId", "documentId");

-- CreateIndex
CREATE INDEX "Attachment_documentId_uploadedAt_idx" ON "Attachment"("documentId", "uploadedAt");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
