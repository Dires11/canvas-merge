-- CreateTable
CREATE TABLE "CourseMetadata" (
    "courseId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "l" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    "c" DOUBLE PRECISION NOT NULL DEFAULT 0.12,
    "h" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMetadata_pkey" PRIMARY KEY ("courseId","domain","userId")
);
