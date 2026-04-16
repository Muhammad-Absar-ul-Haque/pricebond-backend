-- CreateEnum
CREATE TYPE "MarketplaceStatus" AS ENUM ('ACTIVE', 'SOLD', 'REMOVED');

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" TEXT NOT NULL,
    "bondDetails" TEXT,
    "serial" TEXT NOT NULL,
    "denomination" INTEGER NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,
    "status" "MarketplaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
