-- CreateEnum
CREATE TYPE "XeroConnectionStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "XeroExportStatus" AS ENUM ('PUSHED', 'APPROVED', 'REVERSED', 'FAILED');

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "xero_contact_id" TEXT;

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "xero_project_id" TEXT,
ADD COLUMN     "xero_synced_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "xero_employee_id" TEXT;

-- CreateTable
CREATE TABLE "xero_connection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "tenant_name" TEXT NOT NULL DEFAULT '',
    "access_token" TEXT NOT NULL DEFAULT '',
    "refresh_token" TEXT NOT NULL DEFAULT '',
    "access_token_expires_at" TIMESTAMP(3),
    "scopes" TEXT NOT NULL DEFAULT '',
    "status" "XeroConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "default_earnings_rate_id" TEXT NOT NULL DEFAULT '',
    "connected_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_timesheet_export" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" TEXT NOT NULL,
    "xero_timesheet_id" TEXT NOT NULL DEFAULT '',
    "payroll_calendar_id" TEXT NOT NULL DEFAULT '',
    "period_start_date" TEXT NOT NULL DEFAULT '',
    "period_end_date" TEXT NOT NULL DEFAULT '',
    "status" "XeroExportStatus" NOT NULL DEFAULT 'PUSHED',
    "total_units" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lines" JSONB NOT NULL,
    "error" TEXT NOT NULL DEFAULT '',
    "exported_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_timesheet_export_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xero_timesheet_export_user_id_week_start_key" ON "xero_timesheet_export"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "client_xero_contact_id_key" ON "client"("xero_contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_xero_project_id_key" ON "project"("xero_project_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_xero_employee_id_key" ON "user"("xero_employee_id");

-- AddForeignKey
ALTER TABLE "xero_timesheet_export" ADD CONSTRAINT "xero_timesheet_export_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

