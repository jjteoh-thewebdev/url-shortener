-- CreateTable
CREATE TABLE "urls" (
    "id" BIGSERIAL NOT NULL,
    "shortUrl" TEXT,
    "longUrl" TEXT NOT NULL,
    "passwordHash" TEXT,
    "visitorCount" BIGINT NOT NULL DEFAULT 0,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_shortUrl_key" ON "urls"("shortUrl");
