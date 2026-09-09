CREATE TABLE "course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_organization" (
	"course_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	CONSTRAINT "course_organization_course_id_organization_id_pk" PRIMARY KEY("course_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "widget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"implemented" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "widget_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "widget_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "widget_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "widget_widget_category" (
	"widget_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "widget_widget_category_widget_id_category_id_pk" PRIMARY KEY("widget_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_personal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "course_id" uuid;--> statement-breakpoint
INSERT INTO "course" ("slug", "title", "order") VALUES ('quantum-computing', 'Quantum Computing', 0);--> statement-breakpoint
UPDATE "lesson" SET "course_id" = (SELECT "id" FROM "course" WHERE "slug" = 'quantum-computing');--> statement-breakpoint
ALTER TABLE "lesson" ALTER COLUMN "course_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_organization" ADD CONSTRAINT "course_organization_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_organization" ADD CONSTRAINT "course_organization_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_widget_category" ADD CONSTRAINT "widget_widget_category_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_widget_category" ADD CONSTRAINT "widget_widget_category_category_id_widget_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."widget_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- CodeExercise is Qiskit-specific (checks a submitted circuit against an
-- expected one) — renamed to QiskitCodeExercise to leave room for other
-- code-exercise types under future non-quantum courses.
UPDATE "content_block" SET "type" = 'QiskitCodeExercise' WHERE "type" = 'CodeExercise';