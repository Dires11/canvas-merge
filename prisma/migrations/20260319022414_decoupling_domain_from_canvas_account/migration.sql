-- AlterTable
ALTER TABLE "CanvasAccount" ALTER COLUMN "domain" DROP NOT NULL,
ALTER COLUMN "domain_name" DROP NOT NULL,
ALTER COLUMN "domain_slug" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CanvasDomain_user_id_domain_slug_idx" ON "CanvasDomain"("user_id", "domain_slug");
