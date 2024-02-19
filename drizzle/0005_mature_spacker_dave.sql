ALTER TABLE "eventCustomers" ADD COLUMN "clerkUserId" varchar(100);--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN IF EXISTS "user_uuid";