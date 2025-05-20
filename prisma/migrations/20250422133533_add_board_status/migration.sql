/*
  Warnings:

  - The `role` column on the `BoardMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `avatar` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BoardStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Member" AS ENUM ('MEMBER', 'ADMIN', 'OWNER', 'VIEWER');

-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "status" "BoardStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "BoardMember" ADD COLUMN     "lastAccessed" TIMESTAMP(3),
DROP COLUMN "role",
ADD COLUMN     "role" "Member" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "jobName" TEXT,
ADD COLUMN     "location" TEXT,
DROP COLUMN "avatar",
ADD COLUMN     "avatar" JSONB;

-- CreateIndex
CREATE INDEX "BoardMember_userId_idx" ON "BoardMember"("userId");

-- CreateIndex
CREATE INDEX "BoardMember_boardId_idx" ON "BoardMember"("boardId");
