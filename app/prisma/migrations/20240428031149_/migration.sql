/*
  Warnings:

  - A unique constraint covering the columns `[job_number]` on the table `project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auth_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "project_job_number_key" ON "project"("job_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_id_key" ON "user"("auth_id");
