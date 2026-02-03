/*
  Warnings:

  - The primary key for the `UserSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `UserSettings` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserSettings_userId_idx";

-- AlterTable
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_pkey",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId");
