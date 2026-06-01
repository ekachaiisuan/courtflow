CREATE TABLE IF NOT EXISTS "workspace_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"event" text NOT NULL,
	"old_owner_user_id" text NOT NULL,
	"new_owner_user_id" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_audit_logs" ADD CONSTRAINT "workspace_audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_audit_logs_workspace_id_idx" ON "workspace_audit_logs" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_audit_logs_actor_user_id_idx" ON "workspace_audit_logs" USING btree ("actor_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_members_single_owner_unique" ON "workspace_members" USING btree ("workspace_id") WHERE "workspace_members"."role" = 'owner';
