CREATE TABLE IF NOT EXISTS "eventCustomers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"guestCount" numeric DEFAULT '1' NOT NULL,
	"eventUuid" varchar(100) NOT NULL,
	"ticketToken" varchar(255),
	CONSTRAINT "eventCustomers_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "eventCustomers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"eventName" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"thumbnailUrl" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"isFree" boolean DEFAULT false,
	"price" numeric(10, 2),
	"userUuid" varchar(100) NOT NULL,
	"dateTime" varchar(100) NOT NULL,
	CONSTRAINT "events_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT 'uuid_generate_v4()',
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"company" varchar(100),
	"email" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"email_verified" boolean DEFAULT false,
	"sentVerification" boolean DEFAULT false,
	"verification_token" text,
	"reset_token" text,
	"last_email_sent_at" timestamp,
	"setpayment" boolean DEFAULT false,
	"payoutCompleted" boolean DEFAULT false,
	"payoutId" varchar(100),
	"customerId" varchar(100),
	"planType" varchar(100) DEFAULT 'Hobby',
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
