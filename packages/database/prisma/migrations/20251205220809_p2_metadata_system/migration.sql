-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'CHECKBOX', 'TAGS', 'SELECT', 'MULTISELECT', 'LINK');

-- CreateTable
CREATE TABLE "property_definitions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "type" "PropertyType" NOT NULL,
    "description" VARCHAR(255),
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "default_value" VARCHAR(255),
    "icon" VARCHAR(50),
    "color" VARCHAR(7),
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_config" (
    "id" UUID NOT NULL,
    "event_date_field" VARCHAR(50) NOT NULL DEFAULT 'event_date',
    "due_date_field" VARCHAR(50) NOT NULL DEFAULT 'due_date',
    "start_date_field" VARCHAR(50) NOT NULL DEFAULT 'start_date',
    "end_date_field" VARCHAR(50) NOT NULL DEFAULT 'end_date',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_definitions_is_default_idx" ON "property_definitions"("is_default");

-- CreateIndex
CREATE INDEX "property_definitions_type_idx" ON "property_definitions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "property_definitions_name_key" ON "property_definitions"("name");

-- CreateIndex
CREATE INDEX "notes_frontmatter_idx" ON "notes" USING GIN ("frontmatter" jsonb_path_ops);

-- AddForeignKey
ALTER TABLE "property_definitions" ADD CONSTRAINT "property_definitions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
