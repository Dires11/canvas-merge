-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CanvasAccount" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar_url" TEXT NOT NULL,
    "canvas_id" INTEGER NOT NULL,
    "domain_name" TEXT NOT NULL,
    "domain_slug" TEXT NOT NULL,

    CONSTRAINT "CanvasAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "user_id" UUID NOT NULL,
    "preferred_timezone" TEXT,
    "detected_timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "CourseMetadata" (
    "domain" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "l" DOUBLE PRECISION NOT NULL,
    "c" DOUBLE PRECISION NOT NULL,
    "h" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "CourseMetadata_pkey" PRIMARY KEY ("course_id","domain","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasAccount_user_id_domain_slug_canvas_id_key" ON "CanvasAccount"("user_id", "domain_slug", "canvas_id");

