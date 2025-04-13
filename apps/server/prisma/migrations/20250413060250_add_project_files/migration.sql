-- CreateTable
CREATE TABLE "project_file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "project_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "project_file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
