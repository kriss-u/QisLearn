CREATE TYPE "public"."content_block_type" AS ENUM('markdown', 'code_exercise', 'quiz', 'visualization', 'measurement');--> statement-breakpoint
CREATE TABLE "content_block" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"type" "content_block_type" NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"track_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"layout" text NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"org_id" text,
	CONSTRAINT "lesson_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lesson_prerequisite" (
	"lesson_id" uuid NOT NULL,
	"prerequisite_lesson_id" uuid NOT NULL,
	CONSTRAINT "lesson_prerequisite_lesson_id_prerequisite_lesson_id_pk" PRIMARY KEY("lesson_id","prerequisite_lesson_id")
);
--> statement-breakpoint
CREATE TABLE "track" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "track_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "content_block" ADD CONSTRAINT "content_block_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_track_id_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."track"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_prerequisite" ADD CONSTRAINT "lesson_prerequisite_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_prerequisite" ADD CONSTRAINT "lesson_prerequisite_prerequisite_lesson_id_lesson_id_fk" FOREIGN KEY ("prerequisite_lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;