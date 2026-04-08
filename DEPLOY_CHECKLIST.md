# ✅ Checklist Completa di Deploy

## Pre-Deploy

### Database Setup
- [ ] Progetto Supabase creato
- [ ] Tabelle principali esistenti (projects, assets, deadlines, ecc.)
- [ ] Eseguito `database/value_lists.sql`
- [ ] Eseguito `database/rls_policies.sql`
- [ ] Verificato che RLS sia abilitato su tutte le tabelle
- [ ] Dati iniziali value_lists popolati
- [ ] Testato login/registrazione su Supabase Auth

### Codice
- [ ] Repository Git creato
- [ ] Codice pushato su GitHub/GitLab
- [ ] File `.env.local` NON committato (è in .gitignore)
- [ ] Build locale funzionante (`npm run build`)
- [ ] Nessun errore TypeScript
- [ ] Nessun errore ESLint

## Deploy su Vercel

### Configurazione Iniziale
- [ ] Account Vercel creato
- [ ] Progetto importato da Git
- [ ] Framework rilevato come "Next.js"

### Variabili d'Ambiente
Aggiungi in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiI...`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

> **Importante**: Aggiorna `NEXT_PUBLIC_APP_URL` con l'URL effettivo dopo il primo deploy

### Build Settings
- [ ] Build Command: `npm run build` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Node Version: 18.x o superiore

### Deploy
- [ ] Primo deploy completato
- [ ] Build riuscita senza errori
- [ ] App accessibile all'URL Vercel

## Post-Deploy

### Test Funzionalità
- [ ] Login funzionante
- [ ] Registrazione funzionante
- [ ] Email di conferma ricevuta
- [ ] Dashboard carica correttamente
- [ ] Creazione progetto funzionante
- [ ] Creazione asset funzionante
- [ ] Creazione scadenza funzionante
- [ ] Value Lists caricano correttamente
- [ ] Modifiche salvate correttamente
- [ ] Eliminazioni funzionanti

### Configurazione Supabase

#### URL di Callback Auth
In Supabase Dashboard → Authentication → URL Configuration:

- [ ] Site URL: `https://your-app.vercel.app`
- [ ] Redirect URLs: 
  - `https://your-app.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (per sviluppo)

#### Email Templates (Opzionale)
- [ ] Personalizzato template conferma email
- [ ] Personalizzato template reset password
- [ ] Testato ricezione email

### Sicurezza
- [ ] RLS policies verificate e funzionanti
- [ ] Ogni utente vede solo i propri dati
- [ ] Non è possibile accedere a dati di altri utenti
- [ ] API keys pubbliche non esposte nel codice client
- [ ] CORS configurato correttamente

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Immagini ottimizzate
- [ ] CSS e JS minificati

### Monitoring
- [ ] Vercel Analytics abilitato (opzionale)
- [ ] Supabase logs controllati
- [ ] Error tracking configurato (Sentry, opzionale)

## Domain Custom (Opzionale)

Se vuoi usare un dominio personalizzato:

- [ ] Dominio acquistato
- [ ] DNS configurato su Vercel
- [ ] SSL/TLS certificato attivo
- [ ] Redirect da www a non-www (o viceversa)
- [ ] Aggiornato `NEXT_PUBLIC_APP_URL` con nuovo dominio
- [ ] Aggiornato Supabase Site URL con nuovo dominio

## Manutenzione

### Setup CI/CD
- [ ] Auto-deploy su push a `main` branch
- [ ] Preview deploy su pull request
- [ ] Branch `production` per deploy stabili

### Backup
- [ ] Backup automatici Supabase abilitati
- [ ] Piano di disaster recovery documentato
- [ ] Testato restore da backup

### Monitoring Continuo
- [ ] Check settimanale errori Vercel
- [ ] Check settimanale logs Supabase
- [ ] Monitoraggio uptime (opzionale)

## Troubleshooting Deploy

### Errore: "Build failed"
1. Controlla i logs di build su Vercel
2. Verifica che tutte le dipendenze siano in `package.json`
3. Testa `npm run build` in locale

### Errore: "Cannot connect to Supabase"
1. Verifica variabili d'ambiente su Vercel
2. Controlla che URL e KEY siano corretti
3. Verifica che il progetto Supabase sia attivo

### Errore: "new row violates row-level security policy"
1. Verifica che RLS policies siano applicate
2. Controlla che l'utente sia autenticato
3. Verifica ownership dei progetti

### Redirect Loop sul Login
1. Controlla URL in Supabase → Auth → URL Configuration
2. Verifica che `NEXT_PUBLIC_APP_URL` sia corretto
3. Pulisci cache browser e cookie

---

## 🎉 Deploy Completato!

Congratulazioni! La tua app è live.

**Next Steps:**
1. Condividi l'URL con gli utenti
2. Monitora feedback e bug
3. Pianifica nuove feature
4. Mantieni aggiornate le dipendenze

**Link Utili:**
- App: https://your-app.vercel.app
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Repository: https://github.com/your-username/asset-manager

---

**Ultima verifica:** [ ] Tutto funziona perfettamente! 🚀
