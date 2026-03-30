# Setup Backend Supabase - Notary Service Platform

## Langkah 1: Buat Project Supabase

1. Buka https://supabase.com dan login/register
2. Klik "New Project"
3. Isi nama project: `notaris-platform`
4. Pilih region terdekat (Singapore)
5. Set database password (simpan baik-baik)
6. Klik "Create new project" dan tunggu selesai

## Langkah 2: Ambil API Keys

1. Di Supabase Dashboard, buka **Settings** → **API**
2. Catat 3 nilai ini:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Langkah 3: Jalankan Migration SQL

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik "New query"
3. Copy-paste isi file `supabase/migrations/20250101000000_initial_schema.sql`
4. Klik "Run" → semua tabel, FK, RLS, dan index akan dibuat

## Langkah 4: Jalankan Seed Data

1. Masih di SQL Editor, buat query baru
2. Copy-paste isi file `supabase/seed.sql`
3. Klik "Run" → data notaris Annisa Diah Paramitha dan layanannya akan dimasukkan

## Langkah 5: Setup Storage Bucket

1. Di Supabase Dashboard, buka **Storage**
2. Klik "New bucket"
3. Nama: `documents`
4. Centang "Public bucket" (agar file bisa didownload)
5. Klik "Create bucket"

## Langkah 6: Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Langkah 7: Buat Admin User

1. Buka app di browser → klik "Daftar" → register dengan email admin
2. Kembali ke Supabase SQL Editor, jalankan:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'email-admin-kamu@contoh.com';
   ```
3. Login ulang → sekarang bisa akses `/admin`

## Langkah 8: Jalankan App

### Lokal (tanpa Docker):
```bash
npm install
npm run dev
# Akses di http://localhost:3000
```

### Docker:
```bash
sudo docker compose up -d --build
# Akses di http://localhost:3002
```

## Opsional: Notifikasi & AI

Tambahkan ke `.env.local` jika ingin mengaktifkan:

```env
# Email via Resend (https://resend.com)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# WhatsApp via Fonnte (https://fonnte.com)
FONNTE_API_KEY=xxxxx

# AI Chatbot (OpenAI)
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=sk-xxxxx
```

Tanpa env vars ini, app tetap jalan normal — chatbot pakai FAQ fallback, notifikasi tercatat sebagai "failed" di database tapi tidak mengganggu flow.
