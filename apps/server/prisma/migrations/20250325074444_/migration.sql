-- AlterTable
ALTER TABLE "project_parts" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "project_schedule" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
