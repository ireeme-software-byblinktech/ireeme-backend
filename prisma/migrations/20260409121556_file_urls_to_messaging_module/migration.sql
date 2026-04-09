/*
  Warnings:

  - You are about to drop the column `feeRecordId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `fee_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee_record_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'VOICE');

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_feeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_schoolId_fkey";

-- DropIndex
DROP INDEX "stock_sales_school_id_idx";

-- DropIndex
DROP INDEX "transactions_feeRecordId_idx";

-- DropIndex
DROP INDEX "transactions_schoolId_idx";

-- DropIndex
DROP INDEX "transactions_schoolId_paid_at_idx";

-- AlterTable
ALTER TABLE "fee_records" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "file_urls" TEXT[],
ADD COLUMN     "type" "MessageType" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "feeRecordId",
DROP COLUMN "schoolId",
ADD COLUMN     "fee_record_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "grade_appeals" (
    "id" TEXT NOT NULL,
    "grade_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_appeals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_appeals_grade_id_key" ON "grade_appeals"("grade_id");

-- CreateIndex
CREATE INDEX "grade_appeals_school_id_student_id_idx" ON "grade_appeals"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "fee_records_school_id_created_at_idx" ON "fee_records"("school_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_sales_school_id_sold_at_idx" ON "stock_sales"("school_id", "sold_at");

-- CreateIndex
CREATE INDEX "transactions_school_id_paid_at_idx" ON "transactions"("school_id", "paid_at");

-- CreateIndex
CREATE INDEX "transactions_fee_record_id_idx" ON "transactions"("fee_record_id");

-- AddForeignKey
ALTER TABLE "grade_appeals" ADD CONSTRAINT "grade_appeals_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_appeals" ADD CONSTRAINT "grade_appeals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_appeals" ADD CONSTRAINT "grade_appeals_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fee_record_id_fkey" FOREIGN KEY ("fee_record_id") REFERENCES "fee_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
