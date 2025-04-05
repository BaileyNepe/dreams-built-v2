/*
  Warnings:

  - You are about to drop the `due_date` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_part` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "due_date" DROP CONSTRAINT "due_date_project_id_fkey";

-- DropForeignKey
ALTER TABLE "due_date" DROP CONSTRAINT "due_date_project_part_id_fkey";

-- DropTable
DROP TABLE "due_date";

-- DropTable
DROP TABLE "project_part";

-- CreateTable
CREATE TABLE "project_parts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_schedule" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_part_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_parts" ADD CONSTRAINT "project_parts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_schedule" ADD CONSTRAINT "project_schedule_project_part_id_fkey" FOREIGN KEY ("project_part_id") REFERENCES "project_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_schedule" ADD CONSTRAINT "project_schedule_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
