-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_ownerCuid_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_userCuid_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_fromCuid_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_toChannelCuid_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_toUserCuid_fkey";

-- DropForeignKey
ALTER TABLE "users_to_channels" DROP CONSTRAINT "users_to_channels_channelCuid_fkey";

-- DropForeignKey
ALTER TABLE "users_to_channels" DROP CONSTRAINT "users_to_channels_userCuid_fkey";

-- AddForeignKey
ALTER TABLE "users_to_channels" ADD CONSTRAINT "users_to_channels_userCuid_fkey" FOREIGN KEY ("userCuid") REFERENCES "users"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_to_channels" ADD CONSTRAINT "users_to_channels_channelCuid_fkey" FOREIGN KEY ("channelCuid") REFERENCES "channels"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_ownerCuid_fkey" FOREIGN KEY ("ownerCuid") REFERENCES "users"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_fromCuid_fkey" FOREIGN KEY ("fromCuid") REFERENCES "users"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toChannelCuid_fkey" FOREIGN KEY ("toChannelCuid") REFERENCES "channels"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toUserCuid_fkey" FOREIGN KEY ("toUserCuid") REFERENCES "users"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_userCuid_fkey" FOREIGN KEY ("userCuid") REFERENCES "users"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;
