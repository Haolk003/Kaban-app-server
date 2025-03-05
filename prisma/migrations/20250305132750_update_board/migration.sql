/*
  Warnings:

  - A unique constraint covering the columns `[projectKey,ownerId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,ownerId]` on the table `Board` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectKey` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boardId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskNumber` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "projectKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "boardId" TEXT NOT NULL,
ADD COLUMN     "taskNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Board_projectKey_ownerId_key" ON "Board"("projectKey", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Board_title_ownerId_key" ON "Board"("title", "ownerId");

-- CreateIndex
CREATE INDEX "Task_boardId_taskNumber_idx" ON "Task"("boardId", "taskNumber");

-- CreateIndex
CREATE INDEX "Task_taskId_idx" ON "Task"("taskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
