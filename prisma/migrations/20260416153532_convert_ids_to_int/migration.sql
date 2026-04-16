/*
  Warnings:

  - The primary key for the `draws` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `draws` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `marketplace_listings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `marketplace_listings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `buyerId` column on the `marketplace_listings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_bonds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_bonds` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `winning_numbers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `winning_numbers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `sellerId` on the `marketplace_listings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_bonds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `drawId` on the `winning_numbers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "user_bonds" DROP CONSTRAINT "user_bonds_userId_fkey";

-- DropForeignKey
ALTER TABLE "winning_numbers" DROP CONSTRAINT "winning_numbers_drawId_fkey";

-- AlterTable
ALTER TABLE "draws" DROP CONSTRAINT "draws_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "draws_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sellerId",
ADD COLUMN     "sellerId" INTEGER NOT NULL,
DROP COLUMN "buyerId",
ADD COLUMN     "buyerId" INTEGER,
ADD CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_bonds" DROP CONSTRAINT "user_bonds_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "user_bonds_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "winning_numbers" DROP CONSTRAINT "winning_numbers_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "drawId",
ADD COLUMN     "drawId" INTEGER NOT NULL,
ADD CONSTRAINT "winning_numbers_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "winning_numbers" ADD CONSTRAINT "winning_numbers_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bonds" ADD CONSTRAINT "user_bonds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
