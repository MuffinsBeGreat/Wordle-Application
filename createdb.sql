CREATE SCHEMA "public";
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY,
	"username" varchar(50) NOT NULL CONSTRAINT "users_username_key" UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"role" integer NOT NULL,
	"password_changed_by_admin" boolean DEFAULT false
);
CREATE TABLE "words" (
	"id" serial PRIMARY KEY,
	"word" varchar(7) NOT NULL CONSTRAINT "words_word_key" UNIQUE,
	"length" smallint NOT NULL,
	"description" text,
	"word_prefix" varchar(7) GENERATED ALWAYS AS ("left"((word)::text, 7)) STORED
);
CREATE UNIQUE INDEX "users_pkey" ON "users" ("user_id");
CREATE UNIQUE INDEX "users_username_key" ON "users" ("username");
CREATE INDEX "idx_length" ON "words" ("length");
CREATE INDEX "idx_prefix" ON "words" ("word_prefix");
CREATE INDEX "idx_word" ON "words" ("word");
CREATE UNIQUE INDEX "words_pkey" ON "words" ("id");
CREATE UNIQUE INDEX "words_word_key" ON "words" ("word");