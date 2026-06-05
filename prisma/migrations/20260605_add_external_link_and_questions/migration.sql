-- Add external_link column to assignments table
ALTER TABLE "assignments" ADD COLUMN "external_link" TEXT;

-- Create questions table
CREATE TABLE "questions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "assignment_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "marks" DECIMAL(5,2) NOT NULL,
  "options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "correct_answer" TEXT,
  "rubric" TEXT,
  CONSTRAINT "questions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments" ("id") ON DELETE CASCADE
);

-- Create index on assignment_id
CREATE INDEX "questions_assignment_id_idx" ON "questions"("assignment_id");
