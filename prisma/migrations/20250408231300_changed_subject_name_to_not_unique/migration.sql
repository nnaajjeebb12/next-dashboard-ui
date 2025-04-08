-- DropIndex
DROP INDEX "Subject_name_key";

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "name" DROP NOT NULL;
