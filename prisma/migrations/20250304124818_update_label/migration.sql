/*
  Warnings:

  - You are about to drop the column `updated` on the `FileAttachment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,boardId]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `FileAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileAttachment" DROP COLUMN "updated",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_boardId_key" ON "Label"("name", "boardId");
