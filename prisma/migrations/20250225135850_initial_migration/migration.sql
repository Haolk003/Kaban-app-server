/*
  Warnings:

  - You are about to drop the column `password_reset_created_at` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_reset_created_at",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expires_at" TIMESTAMP(3);
