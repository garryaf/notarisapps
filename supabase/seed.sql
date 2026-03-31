-- ============================================================
-- Seed Data: Notaris Multi-Region
-- ============================================================
-- Jalankan SQL ini di Supabase SQL Editor setelah migration

-- Drop existing seed data if re-running
DELETE FROM services WHERE notary_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM notaries WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Notaris 1: Jakarta
INSERT INTO notaries (id, name, address, phone, email, logo_url, region) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Notaris Annisa Diah Paramitha, Mkn., SH', 'Jl. Sudirman No. 123, Jakarta Selatan', '081234567890', 'annisa@notaris.com', '', 'Jakarta');

-- Services for Notaris 1
INSERT INTO services (notary_id, name, description, price) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Jual Beli', 'Pembuatan akta jual beli properti dan tanah', 2500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Pendirian PT', 'Pembuatan akta pendirian perseroan terbatas', 5000000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Legalisasi Dokumen', 'Legalisasi dan waarmerking dokumen', 500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Akta Perjanjian', 'Pembuatan akta perjanjian kerjasama', 1500000),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Surat Kuasa', 'Pembuatan surat kuasa notariil', 750000);

-- Insert admin user (password harus dibuat via Supabase Auth, ini hanya record di tabel users)
-- Setelah register via app, update role jadi admin:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@notaris.com';
