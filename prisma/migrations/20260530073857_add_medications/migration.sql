-- DropIndex
DROP INDEX "appointments_school_id_idx";

-- DropIndex
DROP INDEX "appointments_student_id_idx";

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Stock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medications_school_id_idx" ON "medications"("school_id");

-- CreateIndex
CREATE INDEX "appointments_school_id_student_id_idx" ON "appointments"("school_id", "student_id");

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
