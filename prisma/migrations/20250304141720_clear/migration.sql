/*
  Warnings:

  - You are about to drop the column `statusId` on the `List` table. All the data in the column will be lost.
  - You are about to drop the `TaskStatus` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_statusId_fkey";

-- DropIndex
DROP INDEX "List_statusId_key";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "statusId",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropTable
DROP TABLE "TaskStatus";
