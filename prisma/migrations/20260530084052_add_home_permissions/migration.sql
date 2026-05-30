-- CreateEnum
CREATE TYPE "HomePermissionStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE');

-- CreateTable
CREATE TABLE "home_permissions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "health_issue" TEXT NOT NULL,
    "parent_guardian" TEXT NOT NULL,
    "date_issued" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_return" TIMESTAMP(3) NOT NULL,
    "actual_return" TIMESTAMP(3),
    "status" "HomePermissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_permissions_school_id_student_id_idx" ON "home_permissions"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "home_permissions_school_id_status_idx" ON "home_permissions"("school_id", "status");

-- AddForeignKey
ALTER TABLE "home_permissions" ADD CONSTRAINT "home_permissions_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_permissions" ADD CONSTRAINT "home_permissions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_permissions" ADD CONSTRAINT "home_permissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
