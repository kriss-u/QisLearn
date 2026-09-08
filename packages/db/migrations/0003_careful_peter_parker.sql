CREATE TABLE "lesson_tag" (
	"lesson_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "lesson_tag_lesson_id_tag_id_pk" PRIMARY KEY("lesson_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "module" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "module_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "code_snapshot" (
	"user_id" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"exercise_id" text NOT NULL,
	"code" text NOT NULL,
	"result_ok" boolean,
	"result_messages" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "code_snapshot_user_id_lesson_slug_exercise_id_pk" PRIMARY KEY("user_id","lesson_slug","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"status" text DEFAULT 'not-started' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_user_id_lesson_slug_pk" PRIMARY KEY("user_id","lesson_slug")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt" (
	"user_id" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"quiz_id" text NOT NULL,
	"selected_choice_id" text NOT NULL,
	"submitted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempt_user_id_lesson_slug_quiz_id_pk" PRIMARY KEY("user_id","lesson_slug","quiz_id")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "module_id" uuid;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "difficulty" text DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_tag" ADD CONSTRAINT "lesson_tag_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tag" ADD CONSTRAINT "lesson_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module" ADD CONSTRAINT "module_track_id_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."track"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snapshot" ADD CONSTRAINT "code_snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snapshot" ADD CONSTRAINT "code_snapshot_lesson_slug_lesson_slug_fk" FOREIGN KEY ("lesson_slug") REFERENCES "public"."lesson"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_slug_lesson_slug_fk" FOREIGN KEY ("lesson_slug") REFERENCES "public"."lesson"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_lesson_slug_lesson_slug_fk" FOREIGN KEY ("lesson_slug") REFERENCES "public"."lesson"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_module_id_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."module"("id") ON DELETE set null ON UPDATE no action;