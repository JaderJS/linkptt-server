/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "cuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT NOT NULL DEFAULT 'https://gravatar.com/avatar/d466cb99882b22fc7ac77ef3fe1f58ec?s=200&d=identicon&r=pg',

    CONSTRAINT "users_pkey" PRIMARY KEY ("cuid")
);

-- CreateTable
CREATE TABLE "users_to_channels" (
    "userCuid" TEXT NOT NULL,
    "channelCuid" TEXT NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_to_channels_pkey" PRIMARY KEY ("userCuid","channelCuid")
);

-- CreateTable
CREATE TABLE "channels" (
    "cuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "ownerCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("cuid")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "pathUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "fromCuid" TEXT NOT NULL,
    "toChannelCuid" TEXT,
    "toUserCuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "rssi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "userCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "channels_name_key" ON "channels"("name");

-- AddForeignKey
ALTER TABLE "users_to_channels" ADD CONSTRAINT "users_to_channels_userCuid_fkey" FOREIGN KEY ("userCuid") REFERENCES "users"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_to_channels" ADD CONSTRAINT "users_to_channels_channelCuid_fkey" FOREIGN KEY ("channelCuid") REFERENCES "channels"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "users"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_fromCuid_fkey" FOREIGN KEY ("fromCuid") REFERENCES "users"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toChannelCuid_fkey" FOREIGN KEY ("toChannelCuid") REFERENCES "channels"("cuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toUserCuid_fkey" FOREIGN KEY ("toUserCuid") REFERENCES "users"("cuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_userCuid_fkey" FOREIGN KEY ("userCuid") REFERENCES "users"("cuid") ON DELETE RESTRICT ON UPDATE CASCADE;
