-- AlterTable
ALTER TABLE "project_file" ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "forum_post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "forum_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "forum_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_like" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "forum_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_view" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "forum_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "key" TEXT NOT NULL,
    "originalKey" TEXT,
    "originalSize" INTEGER,
    "originalContentType" TEXT,
    "size" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "forum_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_like_user_id_post_id_key" ON "forum_like"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_view_user_id_post_id_key" ON "forum_view"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "forum_post" ADD CONSTRAINT "forum_post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_like" ADD CONSTRAINT "forum_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_like" ADD CONSTRAINT "forum_like_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_view" ADD CONSTRAINT "forum_view_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_view" ADD CONSTRAINT "forum_view_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_file" ADD CONSTRAINT "forum_file_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
