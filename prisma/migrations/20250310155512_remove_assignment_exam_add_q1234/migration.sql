/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Result` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_examId_fkey";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "assignmentId",
DROP COLUMN "examId",
DROP COLUMN "score",
ADD COLUMN     "q1" INTEGER,
ADD COLUMN     "q2" INTEGER,
ADD COLUMN     "q3" INTEGER,
ADD COLUMN     "q4" INTEGER;
