/*
  Warnings:

  - Made the column `domain_id` on table `CanvasAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CanvasAccount" ALTER COLUMN "domain_id" SET NOT NULL;
