# Row Level Security (RLS) Policies per Supabase

Esegui queste query nel SQL Editor di Supabase per abilitare la sicurezza a livello di riga.

## 1. Abilita RLS su tutte le tabelle

```sql
-- Abilita RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_lists ENABLE ROW LEVEL SECURITY;
```

## 2. Policy per Projects

```sql
-- Gli utenti possono vedere solo i loro progetti
CREATE POLICY "Users can view own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = owner_id);

-- Gli utenti possono creare progetti
CREATE POLICY "Users can create projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Gli utenti possono aggiornare i loro progetti
CREATE POLICY "Users can update own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Gli utenti possono eliminare i loro progetti
CREATE POLICY "Users can delete own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = owner_id);
```

## 3. Policy per Project Members

```sql
-- Gli utenti possono vedere i membri dei loro progetti
CREATE POLICY "Users can view project members"
ON public.project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono aggiungere membri ai loro progetti
CREATE POLICY "Users can add project members"
ON public.project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono rimuovere membri dai loro progetti
CREATE POLICY "Users can remove project members"
ON public.project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
    AND projects.owner_id = auth.uid()
  )
);
```

## 4. Policy per Assets

```sql
-- Gli utenti possono vedere gli asset dei loro progetti
CREATE POLICY "Users can view project assets"
ON public.assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = assets.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono creare asset nei loro progetti
CREATE POLICY "Users can create project assets"
ON public.assets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = assets.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono aggiornare gli asset dei loro progetti
CREATE POLICY "Users can update project assets"
ON public.assets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = assets.project_id
    AND projects.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = assets.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono eliminare gli asset dei loro progetti
CREATE POLICY "Users can delete project assets"
ON public.assets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = assets.project_id
    AND projects.owner_id = auth.uid()
  )
);
```

## 5. Policy per Deadlines

```sql
-- Gli utenti possono vedere le scadenze dei loro progetti
CREATE POLICY "Users can view project deadlines"
ON public.deadlines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = deadlines.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono creare scadenze nei loro progetti
CREATE POLICY "Users can create project deadlines"
ON public.deadlines
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = deadlines.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono aggiornare le scadenze dei loro progetti
CREATE POLICY "Users can update project deadlines"
ON public.deadlines
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = deadlines.project_id
    AND projects.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = deadlines.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono eliminare le scadenze dei loro progetti
CREATE POLICY "Users can delete project deadlines"
ON public.deadlines
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = deadlines.project_id
    AND projects.owner_id = auth.uid()
  )
);
```

## 6. Policy per Deadline Logs

```sql
-- Gli utenti possono vedere i log delle scadenze dei loro progetti
CREATE POLICY "Users can view deadline logs"
ON public.deadline_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deadlines
    JOIN public.projects ON projects.id = deadlines.project_id
    WHERE deadlines.id = deadline_logs.deadline_id
    AND projects.owner_id = auth.uid()
  )
);

-- Gli utenti possono creare log per le scadenze dei loro progetti
CREATE POLICY "Users can create deadline logs"
ON public.deadline_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deadlines
    JOIN public.projects ON projects.id = deadlines.project_id
    WHERE deadlines.id = deadline_logs.deadline_id
    AND projects.owner_id = auth.uid()
  )
);
```

## 7. Policy per Value Lists

```sql
-- Tutti gli utenti autenticati possono leggere le value lists
CREATE POLICY "Authenticated users can view value lists"
ON public.value_lists
FOR SELECT
TO authenticated
USING (true);

-- Solo gli utenti autenticati possono gestire le value lists
-- (In produzione potresti voler limitare questo agli admin)
CREATE POLICY "Authenticated users can manage value lists"
ON public.value_lists
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## Note Importanti

1. **Sicurezza**: Queste policy garantiscono che ogni utente veda solo i propri dati
2. **Performance**: Gli indici esistenti sulle FK ottimizzano queste query
3. **Estensibilità**: Per aggiungere ruoli admin, modifica le policy di value_lists
4. **Testing**: Testa sempre le policy con utenti diversi prima di andare in produzione

## Verifica Policy

Dopo aver applicato le policy, verifica che funzionino:

```sql
-- Verifica che RLS sia abilitato
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verifica le policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## Troubleshooting

**Se vedi "new row violates row-level security policy"**:
- Controlla che l'utente sia autenticato (`auth.uid()` non null)
- Verifica che l'utente sia owner del progetto
- Controlla i log di Supabase per dettagli

**Per disabilitare temporaneamente RLS** (solo in sviluppo):
```sql
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
-- Ripeti per ogni tabella
```
