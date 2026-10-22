CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"faceit_player_id" text NOT NULL,
	"nickname" "citext" NOT NULL,
	"avatar_url" text,
	"country" text,
	"cs2_level" integer,
	"cs2_elo" integer,
	"cs2_region" text,
	"synced_at" timestamp with time zone NOT NULL,
	CONSTRAINT "players_cs2_level_check" CHECK ("players"."cs2_level" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "team_players" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"team_id" uuid NOT NULL,
	"player_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"captain_user_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "teams_tag_check" CHECK (char_length("teams"."tag") between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "trusted_devices" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"label" text,
	"user_agent" text,
	"ip_encrypted" text,
	"ip_hmac" text,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "trusted_devices_token_hash_key" UNIQUE("token_hash"),
	CONSTRAINT "trusted_devices_expiry_check" CHECK ("trusted_devices"."expires_at" > "trusted_devices"."created_at")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"previous_refresh_token_hash" text,
	"auth_methods" text[] NOT NULL,
	"trusted_device_id" uuid,
	"user_agent" text,
	"ip_encrypted" text,
	"ip_hmac" text,
	"last_refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	CONSTRAINT "user_sessions_refresh_token_hash_key" UNIQUE("refresh_token_hash"),
	CONSTRAINT "user_sessions_auth_methods_check" CHECK ("user_sessions"."auth_methods" <@ array['faceit', 'totp', 'trusted_device']::text[] and 'faceit' = any("user_sessions"."auth_methods")),
	CONSTRAINT "user_sessions_revoked_reason_check" CHECK ("user_sessions"."revoked_reason" in ('logout', 'reuse_detected', 'user_revoked', 'two_factor_reset')),
	CONSTRAINT "user_sessions_revoked_check" CHECK (("user_sessions"."revoked_at" is null) = ("user_sessions"."revoked_reason" is null))
);
--> statement-breakpoint
CREATE TABLE "user_two_factors" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'totp' NOT NULL,
	"secret_encrypted" text NOT NULL,
	"last_used_step" bigint,
	"enabled_at" timestamp with time zone,
	CONSTRAINT "user_two_factors_type_check" CHECK ("user_two_factors"."type" in ('totp'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"player_id" uuid NOT NULL,
	"faceit_verified" boolean DEFAULT true NOT NULL
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
CREATE UNIQUE INDEX "players_faceit_player_id_key" ON "players" USING btree ("faceit_player_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "team_players_team_player_key" ON "team_players" USING btree ("team_id","player_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "team_players_player_idx" ON "team_players" USING btree ("player_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "teams_captain_user_idx" ON "teams" USING btree ("captain_user_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "trusted_devices_user_active_idx" ON "trusted_devices" USING btree ("user_id") WHERE revoked_at is null and deleted_at is null;--> statement-breakpoint
CREATE INDEX "trusted_devices_ip_hmac_idx" ON "trusted_devices" USING btree ("ip_hmac") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "user_sessions_user_active_idx" ON "user_sessions" USING btree ("user_id") WHERE revoked_at is null and deleted_at is null;--> statement-breakpoint
CREATE INDEX "user_sessions_previous_refresh_token_hash_idx" ON "user_sessions" USING btree ("previous_refresh_token_hash");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_sessions_ip_hmac_idx" ON "user_sessions" USING btree ("ip_hmac") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_two_factors_user_type_key" ON "user_two_factors" USING btree ("user_id","type") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_player_id_key" ON "users" USING btree ("player_id") WHERE deleted_at is null;