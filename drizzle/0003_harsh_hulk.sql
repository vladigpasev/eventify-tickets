CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"comment_text" text NOT NULL,
	"event_id" uuid NOT NULL,
	"user_uuid" uuid NOT NULL,
	"created_at" timestamp DEFAULT '2024-02-18 11:11:20.638',
	"updated_at" timestamp DEFAULT '2024-02-18 11:11:20.638',
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "comments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "visibility" varchar(100) DEFAULT 'public' NOT NULL;