/*
  This migration contains election_positions changes that were already applied.
  Only the notes table creation should be applied.
*/

-- CreateTable
CREATE TABLE IF NOT EXISTS "notes" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL DEFAULT '',
    "file_size" TEXT NOT NULL DEFAULT '0 MB',
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notes_school_id_idx" ON "notes"("school_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notes_school_id_subject_idx" ON "notes"("school_id", "subject");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notes_school_id_grade_idx" ON "notes"("school_id", "grade");

-- AddForeignKey (wrapped in conditional DO block)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_school_id_fkey') THEN
    ALTER TABLE "notes" ADD CONSTRAINT "notes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_created_by_id_fkey') THEN
    ALTER TABLE "notes" ADD CONSTRAINT "notes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
