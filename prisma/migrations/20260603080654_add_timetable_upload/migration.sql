-- CreateTable
CREATE TABLE "timetable_uploads" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timetable_uploads_teacher_id_key" ON "timetable_uploads"("teacher_id");

-- CreateIndex
CREATE INDEX "timetable_uploads_school_id_idx" ON "timetable_uploads"("school_id");

-- AddForeignKey
ALTER TABLE "timetable_uploads" ADD CONSTRAINT "timetable_uploads_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_uploads" ADD CONSTRAINT "timetable_uploads_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
