-- CreateEnum
CREATE TYPE "PrizeTier" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "BondStatus" AS ENUM ('CHECKED', 'WINNER');

-- CreateTable
CREATE TABLE "draws" (
    "id" TEXT NOT NULL,
    "drawNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "denomination" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winning_numbers" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "prizeTier" "PrizeTier" NOT NULL,
    "prizeAmount" DECIMAL(65,30),
    "drawId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winning_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bonds" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "denomination" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "BondStatus" NOT NULL DEFAULT 'CHECKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bonds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "winning_numbers" ADD CONSTRAINT "winning_numbers_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bonds" ADD CONSTRAINT "user_bonds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
