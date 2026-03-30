-- ============================================================
-- Seed Data: Notaris Annisa Diah Paramitha, Mkn., SH
-- ============================================================
-- Jalankan SQL ini di Supabase SQL Editor setelah migration

-- Insert notaris
INSERT INTO notaries (id, name, address, phone, email, logo_url)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Notaris Annisa Diah Paramitha, Mkn., SH',
  'Jakarta, Indonesia',
  '081234567890',
  'annisa@notaris.com',
  ''
);

-- Insert layanan untuk notaris tersebut
INSERT INTO services (notary_id, name, description, price) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Jual Beli', 'Pembuatan akta jual beli properti dan tanah', 2500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Pendirian PT', 'Pembuatan akta pendirian perseroan terbatas', 5000000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Legalisasi Dokumen', 'Legalisasi dan waarmerking dokumen', 500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Perjanjian', 'Pembuatan akta perjanjian kerjasama dan sewa menyewa', 1500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Surat Kuasa', 'Pembuatan surat kuasa notariil', 750000);

-- Insert admin user (password harus dibuat via Supabase Auth, ini hanya record di tabel users)
-- Setelah register via app, update role jadi admin:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@notaris.com';
