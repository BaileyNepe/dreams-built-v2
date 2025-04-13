-- AlterTable
ALTER TABLE "project_file" ADD COLUMN     "originalContentType" TEXT,
ADD COLUMN     "originalKey" TEXT,
ADD COLUMN     "originalSize" INTEGER;
