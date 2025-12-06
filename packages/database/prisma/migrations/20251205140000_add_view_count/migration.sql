-- P1: Ajouter le compteur de vues sur les notes
-- Migration: add_view_count
-- Description: Ajoute le champ view_count pour tracker le nombre de consultations par note

-- 1. Ajouter le compteur de vues sur les notes
ALTER TABLE "notes" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;

-- 2. Index pour les requêtes de tri par popularité (notes les plus vues)
CREATE INDEX "notes_view_count_idx" ON "notes"("view_count" DESC);
