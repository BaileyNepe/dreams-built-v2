/*
  Warnings:

  - You are about to drop the column `project_id` on the `project_parts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_parts" DROP CONSTRAINT "project_parts_project_id_fkey";

-- AlterTable
ALTER TABLE "project_parts" DROP COLUMN "project_id";
