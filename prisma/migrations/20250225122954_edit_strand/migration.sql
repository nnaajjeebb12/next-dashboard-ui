/*
  Warnings:

  - The primary key for the `Strand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Strand` table. All the data in the column will be lost.
  - You are about to drop the column `strandId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_strandId_fkey";

-- DropIndex
DROP INDEX "Strand_name_key";

-- AlterTable
ALTER TABLE "Strand" DROP CONSTRAINT "Strand_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Strand_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "strandId",
ADD COLUMN     "strandName" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_strandName_fkey" FOREIGN KEY ("strandName") REFERENCES "Strand"("name") ON DELETE SET NULL ON UPDATE CASCADE;
