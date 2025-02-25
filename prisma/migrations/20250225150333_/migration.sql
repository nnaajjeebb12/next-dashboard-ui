/*
  Warnings:

  - The primary key for the `Strand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Strand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Strand` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Strand` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `strandId` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_strandId_fkey";

-- AlterTable
ALTER TABLE "Strand" DROP CONSTRAINT "Strand_pkey",
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Strand_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "strandId",
ADD COLUMN     "strandId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Strand_name_key" ON "Strand"("name");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "Strand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
