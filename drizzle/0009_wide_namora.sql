CREATE TABLE IF NOT EXISTS "fasching_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_code" varchar(50) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(30) NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"seller_id" varchar(100),
	"agreed_to_terms" boolean DEFAULT false NOT NULL,
	"agreed_to_privacy" boolean DEFAULT false NOT NULL,
	"agreed_to_cookies" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fasching_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"ticket_type" varchar(20) NOT NULL,
	"guest_first_name" varchar(255) NOT NULL,
	"guest_last_name" varchar(255) NOT NULL,
	"guest_email" varchar(255) NOT NULL,
	"guest_class_group" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"ticket_code" varchar(50),
	"guest_school_name" varchar(255),
	"guest_external_grade" varchar(50),
	"entered_fasching" boolean DEFAULT false NOT NULL,
	"entered_after" boolean DEFAULT false NOT NULL,
	"vote_token" varchar(255),
	"voted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fasching_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"category_id" varchar(50) NOT NULL,
	"nominee_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paperTickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"eventUuid" varchar(100) NOT NULL,
	"assignedCustomer" varchar(255),
	"nineDigitCode" varchar(9) NOT NULL,
	CONSTRAINT "paperTickets_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "paperTickets_nineDigitCode_unique" UNIQUE("nineDigitCode")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"ticketToken" varchar(255) NOT NULL,
	"rating" numeric,
	"feedback" text,
	CONSTRAINT "ratings_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "ratings_ticketToken_unique" UNIQUE("ticketToken")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sellers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"sellerEmail" varchar(255) NOT NULL,
	"eventUuid" varchar(255) NOT NULL,
	CONSTRAINT "sellers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tombolaItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"itemName" varchar(255) NOT NULL,
	"eventUuid" varchar(100) NOT NULL,
	"winnerUuid" varchar(100),
	CONSTRAINT "tombolaItems_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "hidden" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "rated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "sentEmail" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "isPaperTicket" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "paperTicket" varchar(255);--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "sellerUuid" varchar(100);--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "reservation" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "tombola_weight" numeric;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "min_tombola_weight" numeric;--> statement-breakpoint
ALTER TABLE "eventCustomers" ADD COLUMN "tombola_seller_uuid" varchar(100);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "eventCoordinates" varchar(100);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "limit" numeric;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tombolaPrice" numeric(10, 2);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fv_category" ON "fasching_votes" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fv_cat_nom" ON "fasching_votes" ("category_id","nominee_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fasching_tickets" ADD CONSTRAINT "fasching_tickets_request_id_fasching_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "fasching_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fasching_votes" ADD CONSTRAINT "fasching_votes_ticket_id_fasching_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "fasching_tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
