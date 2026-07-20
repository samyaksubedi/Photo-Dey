-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'user';
