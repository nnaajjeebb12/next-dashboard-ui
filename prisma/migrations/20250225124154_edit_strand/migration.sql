/*
  Warnings:

  - The primary key for the `Strand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Strand` table. All the data in the column will be lost.
  - You are about to drop the column `strandName` on the `Student` table. All the data in the column will be lost.
  - Added the required column `id` to the `Strand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strandId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_strandName_fkey";

-- AlterTable
ALTER TABLE "Strand" DROP CONSTRAINT "Strand_pkey",
DROP COLUMN "name",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Strand_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "strandName",
ADD COLUMN     "strandId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "Strand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
