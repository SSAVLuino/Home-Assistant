# 🚀 Guida Installazione Rapida

## Setup in 5 Minuti

### 1. Installa dipendenze
```bash
npm install
```

### 2. Configura Supabase

**A. Crea progetto su [supabase.com](https://supabase.com)**

**B. Esegui questa query SQL nel SQL Editor di Supabase:**

```sql
-- Copia e incolla il contenuto di database/value_lists.sql
```

**C. Crea file .env.local:**

```bash
cp .env.example .env.local
```

**D. Modifica .env.local con i tuoi dati:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Dove trovo URL e Key?**
> Supabase Dashboard → Settings → API

### 3. Avvia l'app

```bash
npm run dev
```

Apri http://localhost:3000

### 4. Primo Accesso

1. Clicca su "Registrati"
2. Inserisci email e password
3. Controlla la tua email per confermare
4. Accedi e inizia!

---

## Deploy su Vercel (Opzionale)

### Metodo 1: Deploy con GitHub

1. Push del codice su GitHub
2. Vai su [vercel.com](https://vercel.com)
3. Clicca "Import Project"
4. Seleziona il repository
5. Aggiungi le variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (sarà https://tuo-app.vercel.app)
6. Clicca "Deploy"

### Metodo 2: Deploy da CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ✅ Checklist Post-Installazione

- [ ] Database Supabase configurato
- [ ] Tabella value_lists creata e popolata
- [ ] File .env.local configurato
- [ ] App funzionante su localhost:3000
- [ ] Registrazione e login funzionanti
- [ ] Dashboard visualizza correttamente

---

## 🆘 Problemi Comuni

**Errore "relation value_lists does not exist"**
→ Esegui il file `database/value_lists.sql` nel SQL Editor di Supabase

**Errore "Invalid API credentials"**
→ Verifica URL e ANON_KEY nel file .env.local

**Login non funziona**
→ Controlla che l'email sia confermata (vai su Supabase → Authentication)

---

## 📞 Hai bisogno di aiuto?

Apri una issue su GitHub con:
- Descrizione del problema
- Screenshot dell'errore
- Passi per riprodurlo

**Buon lavoro! 🎉**
