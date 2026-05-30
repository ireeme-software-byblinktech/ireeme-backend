/*
  Warnings:

  - You are about to drop the column `election_id` on the `candidates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[position_id,student_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_election_id_fkey";

-- DropIndex
DROP INDEX "candidates_election_id_idx";

-- DropIndex
DROP INDEX "votes_candidate_id_student_id_key";

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "election_id",
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "position_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "elections" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "position_id" TEXT NOT NULL,
ADD COLUMN     "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "election_positions" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_votes" INTEGER NOT NULL DEFAULT 1,
    "max_votes" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "election_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "election_positions_school_id_idx" ON "election_positions"("school_id");

-- CreateIndex
CREATE INDEX "election_positions_election_id_idx" ON "election_positions"("election_id");

-- CreateIndex
CREATE INDEX "candidates_position_id_idx" ON "candidates"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_position_id_student_id_key" ON "votes"("position_id", "student_id");

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
