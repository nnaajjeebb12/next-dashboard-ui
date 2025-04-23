-- DropIndex
DROP INDEX "Student_username_key";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "username" DROP NOT NULL;
