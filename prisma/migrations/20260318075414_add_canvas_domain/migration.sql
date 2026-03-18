-- AlterTable
ALTER TABLE "CanvasAccount" ADD COLUMN     "domain_id" UUID;

-- CreateTable
CREATE TABLE "CanvasDomain" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "domain_name" TEXT NOT NULL,
    "domain_slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanvasDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasDomain_user_id_domain_key" ON "CanvasDomain"("user_id", "domain");

-- AddForeignKey
ALTER TABLE "CanvasAccount" ADD CONSTRAINT "CanvasAccount_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "CanvasDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
