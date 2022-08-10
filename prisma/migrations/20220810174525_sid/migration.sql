/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionToken` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "sessions_tokenHash_key";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "tokenHash",
ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
