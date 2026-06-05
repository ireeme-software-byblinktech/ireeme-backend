-- Add class_id column to assignments table
ALTER TABLE "assignments" ADD COLUMN "class_id" TEXT;

-- Create foreign key constraint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_fkey" 
FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE SET NULL;

-- Create index on class_id
CREATE INDEX "assignments_class_id_idx" ON "assignments"("class_id");
