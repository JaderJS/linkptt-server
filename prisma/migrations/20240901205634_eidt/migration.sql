/*
  Warnings:

  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "path" TEXT NOT NULL DEFAULT 'unknow';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
