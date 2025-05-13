/*
  Warnings:

  - Added the required column `file_public_id` to the `FileAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileAttachment" ADD COLUMN     "file_public_id" TEXT NOT NULL;
