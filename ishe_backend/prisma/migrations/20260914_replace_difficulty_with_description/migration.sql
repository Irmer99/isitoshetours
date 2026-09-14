-- Replace difficulty with description on itineraries
ALTER TABLE "itineraries" DROP COLUMN "difficulty";
ALTER TABLE "itineraries" ADD COLUMN "description" TEXT;