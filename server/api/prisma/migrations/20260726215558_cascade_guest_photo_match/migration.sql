-- DropForeignKey
ALTER TABLE "GuestPhotoMatch" DROP CONSTRAINT "GuestPhotoMatch_photoId_fkey";

-- AddForeignKey
ALTER TABLE "GuestPhotoMatch" ADD CONSTRAINT "GuestPhotoMatch_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
