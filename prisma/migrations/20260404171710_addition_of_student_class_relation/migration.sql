/*
  Warnings:

  - You are about to drop the column `class_id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_class_id_fkey";

-- DropIndex
DROP INDEX "students_school_id_class_id_idx";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "class_id",
DROP COLUMN "enrollmentDate",
DROP COLUMN "isActive",
ADD COLUMN     "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "class_students" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_students_school_id_idx" ON "class_students"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_students_class_id_student_id_key" ON "class_students"("class_id", "student_id");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("school_id");

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
