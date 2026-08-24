-- 00002_phase4_schema.sql

-- Update projects table for Phase 4
ALTER TABLE public.projects
    RENAME COLUMN name TO nombre;
ALTER TABLE public.projects
    ADD COLUMN cliente TEXT,
    ADD COLUMN ubicacion TEXT;

ALTER TABLE public.projects
    DROP COLUMN volumen,
    DROP COLUMN estado;

-- Update documents table for Phase 4
ALTER TABLE public.documents
    RENAME COLUMN tipo TO doc_type;
ALTER TABLE public.documents
    ADD COLUMN folio TEXT,
    ADD COLUMN titulo TEXT,
    ADD COLUMN status TEXT,
    ADD COLUMN notas_crudas TEXT,
    ADD COLUMN contenido TEXT,
    ADD COLUMN estructura JSONB,
    ADD COLUMN fotos JSONB;

ALTER TABLE public.documents
    DROP COLUMN uri,
    DROP COLUMN hash,
    DROP COLUMN region;
