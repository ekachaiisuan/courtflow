ALTER TABLE "boards" DROP CONSTRAINT IF EXISTS "boards_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "boards" DROP COLUMN IF EXISTS "user_id";
--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "workspace_id" text NOT NULL;
--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "boards_workspace_id_idx" ON "boards" USING btree ("workspace_id");
