/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ai_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ai_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `ai_messages` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `ai_messages` table. All the data in the column will be lost.
  - You are about to drop the column `nurseId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `allowLate` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `dueAt` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrls` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `markedById` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `borrowings` table. All the data in the column will be lost.
  - You are about to drop the column `borrowedAt` on the `borrowings` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `borrowings` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `borrowings` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `borrowings` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `convId` on the `conversation_members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `conversation_members` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `caseId` on the `discipline_appeals` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `evidenceUrls` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `offenseTypeId` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `officerId` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `pointsDeduct` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `discipline_cases` table. All the data in the column will be lost.
  - You are about to drop the column `endAt` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `termId` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `totalFee` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `appealStatus` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `gradedAt` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `submissionId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `termId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `nurseId` on the `health_records` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `health_records` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `health_records` table. All the data in the column will be lost.
  - You are about to drop the column `visitDate` on the `health_records` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `library_books` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `library_books` table. All the data in the column will be lost.
  - You are about to drop the column `totalCopies` on the `library_books` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `medical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `convId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `pointDeduction` on the `offense_types` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `offense_types` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `parent_students` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `parent_students` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `permission_requests` table. All the data in the column will be lost.
  - You are about to drop the column `fromDate` on the `permission_requests` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `permission_requests` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `permission_requests` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `stock_items` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `stock_sales` table. All the data in the column will be lost.
  - You are about to drop the column `soldAt` on the `stock_sales` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `stock_sales` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentId` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrls` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `isLate` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `feeRecordId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `uploaded_files` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `uploaded_files` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `candidateId` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,subject_id,date]` on the table `attendance_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conv_id,user_id]` on the table `conversation_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[case_id]` on the table `discipline_appeals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[submission_id]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parent_id,student_id]` on the table `parent_students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `parents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assignment_id,student_id]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[candidate_id,student_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `school_id` to the `ai_conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ai_conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversation_id` to the `ai_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `ai_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nurse_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_at` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `due_at` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_score` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marked_by_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `book_id` to the `borrowings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `due_date` to the `borrowings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `borrowings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `borrowings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conv_id` to the `conversation_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `conversation_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `conversation_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `case_id` to the `discipline_appeals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `discipline_appeals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offense_type_id` to the `discipline_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officer_id` to the `discipline_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points_deduct` to the `discipline_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `discipline_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `discipline_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_at` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_at` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `fee_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `fee_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term_id` to the `fee_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_fee` to the `fee_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_score` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submission_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term_id` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nurse_id` to the `health_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `health_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `health_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `library_books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_copies` to the `library_books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `medical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `medical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conv_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `point_deduction` to the `offense_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `offense_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_id` to the `parent_students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `parent_students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `parent_students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `parents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_date` to the `permission_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `permission_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `permission_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_date` to the `permission_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_hash` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `stock_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `stock_sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `stock_sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `stock_sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignment_id` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee_record_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `uploaded_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `uploaded_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidate_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_userId_fkey";

-- DropForeignKey
ALTER TABLE "ai_messages" DROP CONSTRAINT "ai_messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_nurseId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_markedById_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_studentId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "borrowings" DROP CONSTRAINT "borrowings_bookId_fkey";

-- DropForeignKey
ALTER TABLE "borrowings" DROP CONSTRAINT "borrowings_studentId_fkey";

-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_electionId_fkey";

-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_convId_fkey";

-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "discipline_appeals" DROP CONSTRAINT "discipline_appeals_caseId_fkey";

-- DropForeignKey
ALTER TABLE "discipline_cases" DROP CONSTRAINT "discipline_cases_offenseTypeId_fkey";

-- DropForeignKey
ALTER TABLE "discipline_cases" DROP CONSTRAINT "discipline_cases_officerId_fkey";

-- DropForeignKey
ALTER TABLE "discipline_cases" DROP CONSTRAINT "discipline_cases_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "discipline_cases" DROP CONSTRAINT "discipline_cases_studentId_fkey";

-- DropForeignKey
ALTER TABLE "elections" DROP CONSTRAINT "elections_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "fee_records" DROP CONSTRAINT "fee_records_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "fee_records" DROP CONSTRAINT "fee_records_studentId_fkey";

-- DropForeignKey
ALTER TABLE "fee_records" DROP CONSTRAINT "fee_records_termId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_studentId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_termId_fkey";

-- DropForeignKey
ALTER TABLE "health_records" DROP CONSTRAINT "health_records_nurseId_fkey";

-- DropForeignKey
ALTER TABLE "health_records" DROP CONSTRAINT "health_records_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "health_records" DROP CONSTRAINT "health_records_studentId_fkey";

-- DropForeignKey
ALTER TABLE "library_books" DROP CONSTRAINT "library_books_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "medical_cases" DROP CONSTRAINT "medical_cases_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "medical_cases" DROP CONSTRAINT "medical_cases_studentId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_convId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "parent_students" DROP CONSTRAINT "parent_students_parentId_fkey";

-- DropForeignKey
ALTER TABLE "parent_students" DROP CONSTRAINT "parent_students_studentId_fkey";

-- DropForeignKey
ALTER TABLE "parents" DROP CONSTRAINT "parents_userId_fkey";

-- DropForeignKey
ALTER TABLE "permission_requests" DROP CONSTRAINT "permission_requests_studentId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "stock_sales" DROP CONSTRAINT "stock_sales_itemId_fkey";

-- DropForeignKey
ALTER TABLE "stock_sales" DROP CONSTRAINT "stock_sales_studentId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_userId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_feeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "uploaded_files" DROP CONSTRAINT "uploaded_files_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_studentId_fkey";

-- DropIndex
DROP INDEX "ai_conversations_userId_idx";

-- DropIndex
DROP INDEX "appointments_studentId_idx";

-- DropIndex
DROP INDEX "assignments_schoolId_subjectId_dueAt_idx";

-- DropIndex
DROP INDEX "assignments_schoolId_teacherId_idx";

-- DropIndex
DROP INDEX "attendance_records_schoolId_date_status_idx";

-- DropIndex
DROP INDEX "attendance_records_studentId_date_idx";

-- DropIndex
DROP INDEX "attendance_records_studentId_subjectId_date_key";

-- DropIndex
DROP INDEX "borrowings_studentId_returnedAt_idx";

-- DropIndex
DROP INDEX "candidates_electionId_idx";

-- DropIndex
DROP INDEX "conversation_members_convId_userId_key";

-- DropIndex
DROP INDEX "discipline_appeals_caseId_key";

-- DropIndex
DROP INDEX "discipline_cases_schoolId_studentId_idx";

-- DropIndex
DROP INDEX "elections_schoolId_idx";

-- DropIndex
DROP INDEX "fee_records_schoolId_studentId_idx";

-- DropIndex
DROP INDEX "grades_schoolId_studentId_termId_idx";

-- DropIndex
DROP INDEX "grades_schoolId_subjectId_termId_idx";

-- DropIndex
DROP INDEX "grades_submissionId_key";

-- DropIndex
DROP INDEX "health_records_schoolId_studentId_idx";

-- DropIndex
DROP INDEX "library_books_schoolId_idx";

-- DropIndex
DROP INDEX "medical_cases_schoolId_studentId_idx";

-- DropIndex
DROP INDEX "messages_convId_sentAt_idx";

-- DropIndex
DROP INDEX "notifications_userId_isRead_idx";

-- DropIndex
DROP INDEX "offense_types_schoolId_idx";

-- DropIndex
DROP INDEX "parent_students_parentId_studentId_key";

-- DropIndex
DROP INDEX "parents_userId_key";

-- DropIndex
DROP INDEX "permission_requests_studentId_idx";

-- DropIndex
DROP INDEX "refresh_tokens_userId_idx";

-- DropIndex
DROP INDEX "stock_items_schoolId_idx";

-- DropIndex
DROP INDEX "students_school_id_idx";

-- DropIndex
DROP INDEX "students_userId_key";

-- DropIndex
DROP INDEX "submissions_assignmentId_studentId_key";

-- DropIndex
DROP INDEX "submissions_studentId_status_idx";

-- DropIndex
DROP INDEX "teachers_userId_key";

-- DropIndex
DROP INDEX "transactions_feeRecordId_idx";

-- DropIndex
DROP INDEX "user_roles_userId_role_key";

-- DropIndex
DROP INDEX "users_school_id_isActive_idx";

-- DropIndex
DROP INDEX "votes_candidateId_studentId_key";

-- AlterTable
ALTER TABLE "ai_conversations" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ai_messages" DROP COLUMN "conversationId",
DROP COLUMN "sentAt",
ADD COLUMN     "conversation_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "nurseId",
DROP COLUMN "scheduledAt",
DROP COLUMN "studentId",
ADD COLUMN     "nurse_id" TEXT NOT NULL,
ADD COLUMN     "scheduled_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "allowLate",
DROP COLUMN "createdAt",
DROP COLUMN "dueAt",
DROP COLUMN "fileUrls",
DROP COLUMN "maxScore",
DROP COLUMN "schoolId",
DROP COLUMN "subjectId",
DROP COLUMN "teacherId",
ADD COLUMN     "allow_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "due_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "file_urls" TEXT[],
ADD COLUMN     "max_score" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "teacher_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "attendance_records" DROP COLUMN "markedById",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
DROP COLUMN "subjectId",
ADD COLUMN     "marked_by_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "borrowings" DROP COLUMN "bookId",
DROP COLUMN "borrowedAt",
DROP COLUMN "dueDate",
DROP COLUMN "returnedAt",
DROP COLUMN "studentId",
ADD COLUMN     "book_id" TEXT NOT NULL,
ADD COLUMN     "borrowed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "returned_at" TIMESTAMP(3),
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "electionId",
DROP COLUMN "studentId",
ADD COLUMN     "election_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "conversation_members" DROP COLUMN "convId",
DROP COLUMN "userId",
ADD COLUMN     "conv_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "discipline_appeals" DROP COLUMN "caseId",
ADD COLUMN     "case_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "discipline_cases" DROP COLUMN "createdAt",
DROP COLUMN "evidenceUrls",
DROP COLUMN "offenseTypeId",
DROP COLUMN "officerId",
DROP COLUMN "pointsDeduct",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "evidence_urls" TEXT[],
ADD COLUMN     "offense_type_id" TEXT NOT NULL,
ADD COLUMN     "officer_id" TEXT NOT NULL,
ADD COLUMN     "points_deduct" INTEGER NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "elections" DROP COLUMN "endAt",
DROP COLUMN "schoolId",
DROP COLUMN "startAt",
ADD COLUMN     "end_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "start_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "fee_records" DROP COLUMN "amountPaid",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
DROP COLUMN "termId",
DROP COLUMN "totalFee",
ADD COLUMN     "amount_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "term_id" TEXT NOT NULL,
ADD COLUMN     "total_fee" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "grades" DROP COLUMN "appealStatus",
DROP COLUMN "gradedAt",
DROP COLUMN "maxScore",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
DROP COLUMN "subjectId",
DROP COLUMN "submissionId",
DROP COLUMN "teacherId",
DROP COLUMN "termId",
ADD COLUMN     "appeal_status" "AppealStatus",
ADD COLUMN     "graded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "max_score" DECIMAL(6,2) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "submission_id" TEXT NOT NULL,
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD COLUMN     "term_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "health_records" DROP COLUMN "nurseId",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
DROP COLUMN "visitDate",
ADD COLUMN     "nurse_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "library_books" DROP COLUMN "coverUrl",
DROP COLUMN "schoolId",
DROP COLUMN "totalCopies",
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "total_copies" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "medical_cases" DROP COLUMN "openedAt",
DROP COLUMN "schoolId",
DROP COLUMN "studentId",
ADD COLUMN     "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "convId",
DROP COLUMN "isRead",
DROP COLUMN "senderId",
DROP COLUMN "sentAt",
ADD COLUMN     "conv_id" TEXT NOT NULL,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL,
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "schoolId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "offense_types" DROP COLUMN "pointDeduction",
DROP COLUMN "schoolId",
ADD COLUMN     "point_deduction" INTEGER NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "parent_students" DROP COLUMN "parentId",
DROP COLUMN "studentId",
ADD COLUMN     "parent_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "parents" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "permission_requests" DROP COLUMN "approvedBy",
DROP COLUMN "fromDate",
DROP COLUMN "studentId",
DROP COLUMN "toDate",
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "from_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "to_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "tokenHash",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "token_hash" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "logoUrl",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logo_url" TEXT;

-- AlterTable
ALTER TABLE "stock_items" DROP COLUMN "schoolId",
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_sales" DROP COLUMN "itemId",
DROP COLUMN "soldAt",
DROP COLUMN "studentId",
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "sold_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "userId",
ADD COLUMN     "class_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "assignmentId",
DROP COLUMN "fileUrls",
DROP COLUMN "isLate",
DROP COLUMN "studentId",
DROP COLUMN "submittedAt",
ADD COLUMN     "assignment_id" TEXT NOT NULL,
ADD COLUMN     "file_urls" TEXT[],
ADD COLUMN     "is_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "feeRecordId",
DROP COLUMN "paidAt",
ADD COLUMN     "fee_record_id" TEXT NOT NULL,
ADD COLUMN     "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "uploaded_files" DROP COLUMN "mimeType",
DROP COLUMN "schoolId",
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "userId",
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "lastLoginAt",
DROP COLUMN "lastName",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "candidateId",
DROP COLUMN "studentId",
ADD COLUMN     "candidate_id" TEXT NOT NULL,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "employee_num" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");

-- CreateIndex
CREATE INDEX "staff_profiles_school_id_idx" ON "staff_profiles"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_school_id_employee_num_key" ON "staff_profiles"("school_id", "employee_num");

-- CreateIndex
CREATE INDEX "ai_conversations_school_id_idx" ON "ai_conversations"("school_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_school_id_idx" ON "ai_messages"("school_id");

-- CreateIndex
CREATE INDEX "appointments_school_id_idx" ON "appointments"("school_id");

-- CreateIndex
CREATE INDEX "appointments_student_id_idx" ON "appointments"("student_id");

-- CreateIndex
CREATE INDEX "assignments_school_id_subject_id_due_at_idx" ON "assignments"("school_id", "subject_id", "due_at");

-- CreateIndex
CREATE INDEX "assignments_school_id_teacher_id_idx" ON "assignments"("school_id", "teacher_id");

-- CreateIndex
CREATE INDEX "attendance_records_school_id_date_status_idx" ON "attendance_records"("school_id", "date", "status");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_date_idx" ON "attendance_records"("student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_student_id_subject_id_date_key" ON "attendance_records"("student_id", "subject_id", "date");

-- CreateIndex
CREATE INDEX "borrowings_school_id_idx" ON "borrowings"("school_id");

-- CreateIndex
CREATE INDEX "borrowings_student_id_returned_at_idx" ON "borrowings"("student_id", "returned_at");

-- CreateIndex
CREATE INDEX "candidates_school_id_idx" ON "candidates"("school_id");

-- CreateIndex
CREATE INDEX "candidates_election_id_idx" ON "candidates"("election_id");

-- CreateIndex
CREATE INDEX "conversation_members_school_id_idx" ON "conversation_members"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conv_id_user_id_key" ON "conversation_members"("conv_id", "user_id");

-- CreateIndex
CREATE INDEX "conversations_school_id_idx" ON "conversations"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_appeals_case_id_key" ON "discipline_appeals"("case_id");

-- CreateIndex
CREATE INDEX "discipline_appeals_school_id_idx" ON "discipline_appeals"("school_id");

-- CreateIndex
CREATE INDEX "discipline_cases_school_id_student_id_idx" ON "discipline_cases"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "elections_school_id_idx" ON "elections"("school_id");

-- CreateIndex
CREATE INDEX "fee_records_school_id_student_id_idx" ON "fee_records"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_submission_id_key" ON "grades"("submission_id");

-- CreateIndex
CREATE INDEX "grades_school_id_student_id_term_id_idx" ON "grades"("school_id", "student_id", "term_id");

-- CreateIndex
CREATE INDEX "grades_school_id_subject_id_term_id_idx" ON "grades"("school_id", "subject_id", "term_id");

-- CreateIndex
CREATE INDEX "health_records_school_id_student_id_idx" ON "health_records"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "library_books_school_id_idx" ON "library_books"("school_id");

-- CreateIndex
CREATE INDEX "medical_cases_school_id_student_id_idx" ON "medical_cases"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "messages_school_id_idx" ON "messages"("school_id");

-- CreateIndex
CREATE INDEX "messages_conv_id_sent_at_idx" ON "messages"("conv_id", "sent_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_school_id_idx" ON "notifications"("school_id");

-- CreateIndex
CREATE INDEX "offense_types_school_id_idx" ON "offense_types"("school_id");

-- CreateIndex
CREATE INDEX "parent_students_school_id_idx" ON "parent_students"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_students_parent_id_student_id_key" ON "parent_students"("parent_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "parents_user_id_key" ON "parents"("user_id");

-- CreateIndex
CREATE INDEX "permission_requests_school_id_idx" ON "permission_requests"("school_id");

-- CreateIndex
CREATE INDEX "permission_requests_student_id_idx" ON "permission_requests"("student_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_school_id_idx" ON "refresh_tokens"("school_id");

-- CreateIndex
CREATE INDEX "stock_items_school_id_idx" ON "stock_items"("school_id");

-- CreateIndex
CREATE INDEX "stock_sales_school_id_idx" ON "stock_sales"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE INDEX "students_school_id_class_id_idx" ON "students"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "students_school_id_is_active_idx" ON "students"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "submissions_school_id_idx" ON "submissions"("school_id");

-- CreateIndex
CREATE INDEX "submissions_student_id_status_idx" ON "submissions"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_assignment_id_student_id_key" ON "submissions"("assignment_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE INDEX "transactions_school_id_idx" ON "transactions"("school_id");

-- CreateIndex
CREATE INDEX "transactions_fee_record_id_idx" ON "transactions"("fee_record_id");

-- CreateIndex
CREATE INDEX "uploaded_files_school_id_idx" ON "uploaded_files"("school_id");

-- CreateIndex
CREATE INDEX "user_roles_school_id_idx" ON "user_roles"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE INDEX "users_school_id_is_active_idx" ON "users"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "votes_school_id_idx" ON "votes"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_candidate_id_student_id_key" ON "votes"("candidate_id", "student_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_cases" ADD CONSTRAINT "medical_cases_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_cases" ADD CONSTRAINT "medical_cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offense_types" ADD CONSTRAINT "offense_types_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_cases" ADD CONSTRAINT "discipline_cases_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_cases" ADD CONSTRAINT "discipline_cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_cases" ADD CONSTRAINT "discipline_cases_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_cases" ADD CONSTRAINT "discipline_cases_offense_type_id_fkey" FOREIGN KEY ("offense_type_id") REFERENCES "offense_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_appeals" ADD CONSTRAINT "discipline_appeals_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_appeals" ADD CONSTRAINT "discipline_appeals_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "discipline_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fee_record_id_fkey" FOREIGN KEY ("fee_record_id") REFERENCES "fee_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_sales" ADD CONSTRAINT "stock_sales_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_sales" ADD CONSTRAINT "stock_sales_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_sales" ADD CONSTRAINT "stock_sales_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conv_id_fkey" FOREIGN KEY ("conv_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conv_id_fkey" FOREIGN KEY ("conv_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
