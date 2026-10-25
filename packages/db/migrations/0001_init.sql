CREATE TYPE "public"."auth_method" AS ENUM('faceit', 'password', 'totp', 'trusted_device');--> statement-breakpoint
CREATE TYPE "public"."session_revoked_reason" AS ENUM('logout', 'reuse_detected', 'user_revoked', 'two_factor_reset', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."two_factor_type" AS ENUM('totp');--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"faceit_player_id" text NOT NULL,
	"nickname" "citext" NOT NULL,
	"avatar_url" text,
	"country" text,
	"cs2_level" integer,
	"cs2_elo" integer,
	"cs2_region" text,
	"synced_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_players" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"team_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"captain_user_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trusted_devices" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"label" text,
	"user_agent" text,
	"ip_encrypted" text,
	"ip_hmac" text,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "trusted_devices_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"previous_refresh_token_hash" text,
	"auth_methods" "auth_method"[] NOT NULL,
	"trusted_device_id" uuid,
	"user_agent" text,
	"ip_encrypted" text,
	"ip_hmac" text,
	"last_refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" "session_revoked_reason",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_sessions_refresh_token_hash_key" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_two_factors" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "two_factor_type" DEFAULT 'totp' NOT NULL,
	"secret_encrypted" text NOT NULL,
	"last_used_step" bigint,
	"enabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"player_id" uuid,
	"faceit_verified" boolean DEFAULT true NOT NULL,
	"display_name" text NOT NULL,
	"email_encrypted" text,
	"email_hmac" text,
	"email_verified_at" timestamp with time zone,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_captain_user_id_users_id_fk" FOREIGN KEY ("captain_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_trusted_device_id_trusted_devices_id_fk" FOREIGN KEY ("trusted_device_id") REFERENCES "public"."trusted_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_two_factors" ADD CONSTRAINT "user_two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "players_faceit_player_id_key" ON "players" USING btree ("faceit_player_id") WHERE "players"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "team_players_team_player_key" ON "team_players" USING btree ("team_id","player_id") WHERE "team_players"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "team_players_player_idx" ON "team_players" USING btree ("player_id") WHERE "team_players"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "teams_captain_user_idx" ON "teams" USING btree ("captain_user_id") WHERE "teams"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "trusted_devices_user_active_idx" ON "trusted_devices" USING btree ("user_id") WHERE ("trusted_devices"."revoked_at" is null and "trusted_devices"."deleted_at" is null);--> statement-breakpoint
CREATE INDEX "trusted_devices_ip_hmac_idx" ON "trusted_devices" USING btree ("ip_hmac") WHERE "trusted_devices"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "user_sessions_user_active_idx" ON "user_sessions" USING btree ("user_id") WHERE ("user_sessions"."revoked_at" is null and "user_sessions"."deleted_at" is null);--> statement-breakpoint
CREATE INDEX "user_sessions_previous_refresh_token_hash_idx" ON "user_sessions" USING btree ("previous_refresh_token_hash");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_ip_hmac_idx" ON "user_sessions" USING btree ("ip_hmac") WHERE "user_sessions"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_two_factors_user_type_key" ON "user_two_factors" USING btree ("user_id","type") WHERE "user_two_factors"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_player_id_key" ON "users" USING btree ("player_id") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_hmac_key" ON "users" USING btree ("email_hmac") WHERE "users"."deleted_at" is null;