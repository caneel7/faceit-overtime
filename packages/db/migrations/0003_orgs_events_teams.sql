CREATE TYPE "public"."game" AS ENUM('cs2');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'declined', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('EU', 'NA', 'SA', 'OCE', 'SEA');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('player', 'coach');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."user_token_purpose" ADD VALUE 'account_activation';--> statement-breakpoint
ALTER TYPE "public"."user_token_purpose" ADD VALUE 'email_add';--> statement-breakpoint
DROP TABLE "team_players" CASCADE;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD COLUMN "email_encrypted" text;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD COLUMN "email_hmac" text;--> statement-breakpoint
CREATE TABLE "org_users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "org_role" NOT NULL,
	"status" "invite_status" NOT NULL,
	"invited_by" uuid,
	"expires_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" "citext" NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_invites" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_role" NOT NULL,
	"status" "invite_status" NOT NULL,
	"invited_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"org_id" uuid NOT NULL,
	"slug" "citext" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"game" "game" DEFAULT 'cs2' NOT NULL,
	"status" "tournament_status" DEFAULT 'draft' NOT NULL,
	"team_size" integer DEFAULT 5 NOT NULL,
	"max_subs" integer DEFAULT 1 NOT NULL,
	"max_teams" integer DEFAULT 16 NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"max_level" integer DEFAULT 10 NOT NULL,
	"regions" "region"[] DEFAULT '{}' NOT NULL,
	"registration_opens_at" timestamp with time zone NOT NULL,
	"registration_closes_at" timestamp with time zone NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"wins_to_advance" integer DEFAULT 3 NOT NULL,
	"losses_to_eliminate" integer DEFAULT 3 NOT NULL,
	"best_of" integer DEFAULT 1 NOT NULL,
	"decider_best_of" integer DEFAULT 3 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_users_live_key" ON "org_users" USING btree ("org_id","user_id") WHERE ("org_users"."deleted_at" is null and "org_users"."status" in ('pending', 'accepted'));--> statement-breakpoint
CREATE UNIQUE INDEX "org_users_owner_key" ON "org_users" USING btree ("org_id") WHERE ("org_users"."role" = 'owner' and "org_users"."deleted_at" is null);--> statement-breakpoint
CREATE INDEX "org_users_user_idx" ON "org_users" USING btree ("user_id","status") WHERE "org_users"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "orgs_slug_key" ON "orgs" USING btree ("slug") WHERE "orgs"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "team_invites_open_key" ON "team_invites" USING btree ("team_id","user_id") WHERE ("team_invites"."status" = 'pending' and "team_invites"."deleted_at" is null);--> statement-breakpoint
CREATE INDEX "team_invites_user_idx" ON "team_invites" USING btree ("user_id","status") WHERE "team_invites"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_team_user_key" ON "team_members" USING btree ("team_id","user_id") WHERE "team_members"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "team_members_user_idx" ON "team_members" USING btree ("user_id") WHERE "team_members"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments" USING btree ("slug") WHERE "tournaments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "tournaments_org_status_idx" ON "tournaments" USING btree ("org_id","status") WHERE "tournaments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "tournaments_status_closes_idx" ON "tournaments" USING btree ("status","registration_closes_at") WHERE "tournaments"."deleted_at" is null;