/*
  Warnings:

  - The `status` column on the `List` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[boardId,name]` on the table `List` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'HIDDEN', 'TEMPLATE');

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "color" TEXT,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taskCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "ListStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "List_boardId_idx" ON "List"("boardId");

-- CreateIndex
CREATE INDEX "List_order_idx" ON "List"("order");

-- CreateIndex
CREATE UNIQUE INDEX "List_boardId_name_key" ON "List"("boardId", "name");
