/*
  Warnings:

  - You are about to drop the column `domain` on the `CanvasAccount` table. All the data in the column will be lost.
  - You are about to drop the column `domain_name` on the `CanvasAccount` table. All the data in the column will be lost.
  - You are about to drop the column `domain_slug` on the `CanvasAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,domain_id,canvas_id]` on the table `CanvasAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CanvasAccount_user_id_domain_slug_canvas_id_key";

-- AlterTable
ALTER TABLE "CanvasAccount" DROP COLUMN "domain",
DROP COLUMN "domain_name",
DROP COLUMN "domain_slug";

-- CreateIndex
CREATE UNIQUE INDEX "CanvasAccount_user_id_domain_id_canvas_id_key" ON "CanvasAccount"("user_id", "domain_id", "canvas_id");
