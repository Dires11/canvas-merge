/*
  Warnings:

  - The primary key for the `CourseMetadata` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `courseId` on the `CourseMetadata` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CourseMetadata" DROP CONSTRAINT "CourseMetadata_pkey",
DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD CONSTRAINT "CourseMetadata_pkey" PRIMARY KEY ("courseId", "domain", "userId");
