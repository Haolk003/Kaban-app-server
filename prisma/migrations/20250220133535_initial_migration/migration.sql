-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_reset_created_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_expires_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_token_hash" TEXT;
