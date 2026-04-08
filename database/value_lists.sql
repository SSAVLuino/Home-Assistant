-- Tabella per gestire le value list configurabili
CREATE TABLE IF NOT EXISTS public.value_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'asset_type', 'deadline_category', 'deadline_frequency', 'member_role'
  value TEXT NOT NULL, -- valore da salvare nel DB
  label TEXT NOT NULL, -- etichetta visualizzata all'utente
  order_index INTEGER NULL DEFAULT 0,
  is_active BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT value_lists_pkey PRIMARY KEY (id),
  CONSTRAINT value_lists_unique UNIQUE (category, value)
) TABLESPACE pg_default;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_value_lists_category ON public.value_lists(category, is_active, order_index);

-- Inserimento dati iniziali
INSERT INTO public.value_lists (category, value, label, order_index) VALUES
-- Tipi di asset
('asset_type', 'immobile', 'Immobile', 1),
('asset_type', 'veicolo', 'Veicolo', 2),
('asset_type', 'attrezzatura', 'Attrezzatura', 3),
('asset_type', 'strumento', 'Strumento', 4),
('asset_type', 'altro', 'Altro', 5),

-- Categorie scadenze
('deadline_category', 'fiscale', 'Fiscale', 1),
('deadline_category', 'amministrativo', 'Amministrativo', 2),
('deadline_category', 'manutenzione', 'Manutenzione', 3),
('deadline_category', 'assicurativo', 'Assicurativo', 4),
('deadline_category', 'contrattuale', 'Contrattuale', 5),
('deadline_category', 'altro', 'Altro', 6),

-- Frequenze scadenze
('deadline_frequency', 'once', 'Una tantum', 1),
('deadline_frequency', 'daily', 'Giornaliera', 2),
('deadline_frequency', 'weekly', 'Settimanale', 3),
('deadline_frequency', 'monthly', 'Mensile', 4),
('deadline_frequency', 'quarterly', 'Trimestrale', 5),
('deadline_frequency', 'yearly', 'Annuale', 6),

-- Ruoli membri progetto
('member_role', 'owner', 'Proprietario', 1),
('member_role', 'admin', 'Amministratore', 2),
('member_role', 'editor', 'Editor', 3),
('member_role', 'viewer', 'Visualizzatore', 4)
ON CONFLICT (category, value) DO NOTHING;
