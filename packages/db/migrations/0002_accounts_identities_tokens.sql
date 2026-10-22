CREATE TABLE "user_identities" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	CONSTRAINT "user_identities_provider_check" CHECK ("user_identities"."provider" in ('faceit'))
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "user_tokens_token_hash_key" UNIQUE("token_hash"),
	CONSTRAINT "user_tokens_purpose_check" CHECK ("user_tokens"."purpose" in ('email_verification', 'password_reset')),
	CONSTRAINT "user_tokens_expiry_check" CHECK ("user_tokens"."expires_at" > "user_tokens"."created_at")
);
--> statement-breakpoint
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_auth_methods_check";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_revoked_reason_check";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "player_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_encrypted" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_hmac" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_identities_provider_key" ON "user_identities" USING btree ("provider","provider_user_id") WHERE deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_identities_user_provider_key" ON "user_identities" USING btree ("user_id","provider") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "user_tokens_user_open_idx" ON "user_tokens" USING btree ("user_id","purpose") WHERE used_at is null and deleted_at is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_hmac_key" ON "users" USING btree ("email_hmac") WHERE deleted_at is null;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_auth_methods_check" CHECK ("user_sessions"."auth_methods" <@ array['faceit', 'password', 'totp', 'trusted_device']::text[] and ('faceit' = any("user_sessions"."auth_methods") or 'password' = any("user_sessions"."auth_methods")));--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_revoked_reason_check" CHECK ("user_sessions"."revoked_reason" in ('logout', 'reuse_detected', 'user_revoked', 'two_factor_reset', 'password_reset'));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_display_name_check" CHECK (char_length("users"."display_name") between 1 and 32);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_pair_check" CHECK (("users"."email_hmac" is null) = ("users"."email_encrypted" is null));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_password_needs_email_check" CHECK ("users"."password_hash" is null or "users"."email_hmac" is not null);