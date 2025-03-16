-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "lessonId" INTEGER;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
