/*
  Warnings:

  - You are about to drop the column `present` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "present",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "brgy" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "fatherMiddleName" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherSurname" TEXT,
ADD COLUMN     "guardianMiddleName" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianRelation" TEXT,
ADD COLUMN     "guardianSurname" TEXT,
ADD COLUMN     "learningModal" TEXT,
ADD COLUMN     "lrn" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "motherMiddleName" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherSurname" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "purok" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "remarks" TEXT;
