-- CreateTable
CREATE TABLE "job_sheet" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "rules" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_sheet_snapshot" (
    "id" TEXT NOT NULL,
    "job_sheet_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "blob" JSONB NOT NULL,
    "created_by_id" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_sheet_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_sheet_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "data" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sheet_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_sheet_project_id_key" ON "job_sheet"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_sheet_snapshot_job_sheet_id_version_key" ON "job_sheet_snapshot"("job_sheet_id", "version");

-- AddForeignKey
ALTER TABLE "job_sheet" ADD CONSTRAINT "job_sheet_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_sheet_snapshot" ADD CONSTRAINT "job_sheet_snapshot_job_sheet_id_fkey" FOREIGN KEY ("job_sheet_id") REFERENCES "job_sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_sheet_snapshot" ADD CONSTRAINT "job_sheet_snapshot_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
