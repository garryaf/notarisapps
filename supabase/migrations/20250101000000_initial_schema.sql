-- ============================================================
-- Notary Service Platform - Initial Database Schema
-- ============================================================
-- Tasks: 2.1 - 2.10 (Database Schema dan RLS)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2.1: Tabel users
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  notary_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.2: Tabel notaries
-- ============================================================
CREATE TABLE notaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.3: Tabel services
-- ============================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notary_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.4: Tabel orders
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  notary_id UUID NOT NULL,
  service_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifikasi', 'diproses', 'revisi', 'selesai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.5: Tabel documents
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.6: Tabel status_histories
-- ============================================================
CREATE TABLE status_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.7: Tabel chats
-- ============================================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.8: Tabel notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2.9: Foreign Key Constraints
-- ============================================================

-- users.notary_id → notaries.id
ALTER TABLE users
  ADD CONSTRAINT fk_users_notary
  FOREIGN KEY (notary_id) REFERENCES notaries(id) ON DELETE SET NULL;

-- services.notary_id → notaries.id
ALTER TABLE services
  ADD CONSTRAINT fk_services_notary
  FOREIGN KEY (notary_id) REFERENCES notaries(id) ON DELETE CASCADE;

-- orders.notary_id → notaries.id
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_notary
  FOREIGN KEY (notary_id) REFERENCES notaries(id) ON DELETE RESTRICT;

-- orders.service_id → services.id
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_service
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;

-- documents.order_id → orders.id
ALTER TABLE documents
  ADD CONSTRAINT fk_documents_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- status_histories.order_id → orders.id
ALTER TABLE status_histories
  ADD CONSTRAINT fk_status_histories_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- status_histories.changed_by → users.id
ALTER TABLE status_histories
  ADD CONSTRAINT fk_status_histories_changed_by
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT;

-- chats.order_id → orders.id (nullable)
ALTER TABLE chats
  ADD CONSTRAINT fk_chats_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- notifications.order_id → orders.id
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- ============================================================
-- 2.10: Row Level Security (RLS) Policies
-- ============================================================

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------
-- RLS: users
-- --------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can SELECT their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());

-- Admin can SELECT all users
CREATE POLICY users_select_admin ON users
  FOR SELECT USING (is_admin());

-- Admin can INSERT users
CREATE POLICY users_insert_admin ON users
  FOR INSERT WITH CHECK (is_admin());

-- Admin can UPDATE all users
CREATE POLICY users_update_admin ON users
  FOR UPDATE USING (is_admin());

-- Allow insert during registration (service role handles this, but also allow authenticated)
CREATE POLICY users_insert_self ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- --------------------------------------------------------
-- RLS: notaries
-- --------------------------------------------------------
ALTER TABLE notaries ENABLE ROW LEVEL SECURITY;

-- Everyone can SELECT notaries (public)
CREATE POLICY notaries_select_public ON notaries
  FOR SELECT USING (true);

-- Admin can INSERT notaries
CREATE POLICY notaries_insert_admin ON notaries
  FOR INSERT WITH CHECK (is_admin());

-- Admin can UPDATE notaries
CREATE POLICY notaries_update_admin ON notaries
  FOR UPDATE USING (is_admin());

-- Admin can DELETE notaries
CREATE POLICY notaries_delete_admin ON notaries
  FOR DELETE USING (is_admin());

-- --------------------------------------------------------
-- RLS: services
-- --------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Everyone can SELECT services (public)
CREATE POLICY services_select_public ON services
  FOR SELECT USING (true);

-- Admin can INSERT services
CREATE POLICY services_insert_admin ON services
  FOR INSERT WITH CHECK (is_admin());

-- Admin can UPDATE services
CREATE POLICY services_update_admin ON services
  FOR UPDATE USING (is_admin());

-- Admin can DELETE services
CREATE POLICY services_delete_admin ON services
  FOR DELETE USING (is_admin());

-- --------------------------------------------------------
-- RLS: orders
-- --------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can SELECT their own orders (matched by email)
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (
    user_email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Admin can SELECT all orders
CREATE POLICY orders_select_admin ON orders
  FOR SELECT USING (is_admin());

-- Admin can UPDATE all orders
CREATE POLICY orders_update_admin ON orders
  FOR UPDATE USING (is_admin());

-- Authenticated users can INSERT orders
CREATE POLICY orders_insert_authenticated ON orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- RLS: documents
-- --------------------------------------------------------
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can SELECT documents for their own orders
CREATE POLICY documents_select_own ON documents
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE user_email = (SELECT email FROM users WHERE id = auth.uid())
    )
  );

-- Admin can SELECT all documents
CREATE POLICY documents_select_admin ON documents
  FOR SELECT USING (is_admin());

-- Authenticated users can INSERT documents
CREATE POLICY documents_insert_authenticated ON documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- RLS: status_histories
-- --------------------------------------------------------
ALTER TABLE status_histories ENABLE ROW LEVEL SECURITY;

-- Users can SELECT status histories for their own orders
CREATE POLICY status_histories_select_own ON status_histories
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE user_email = (SELECT email FROM users WHERE id = auth.uid())
    )
  );

-- Admin can SELECT all status histories
CREATE POLICY status_histories_select_admin ON status_histories
  FOR SELECT USING (is_admin());

-- Admin can INSERT status histories
CREATE POLICY status_histories_insert_admin ON status_histories
  FOR INSERT WITH CHECK (is_admin());

-- --------------------------------------------------------
-- RLS: chats
-- --------------------------------------------------------
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT chats
CREATE POLICY chats_select_authenticated ON chats
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can INSERT chats
CREATE POLICY chats_insert_authenticated ON chats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- RLS: notifications
-- --------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin can SELECT all notifications
CREATE POLICY notifications_select_admin ON notifications
  FOR SELECT USING (is_admin());

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX idx_orders_notary_id ON orders(notary_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_email ON orders(user_email);
CREATE INDEX idx_services_notary_id ON services(notary_id);
CREATE INDEX idx_documents_order_id ON documents(order_id);
CREATE INDEX idx_status_histories_order_id ON status_histories(order_id);
CREATE INDEX idx_chats_order_id ON chats(order_id);
CREATE INDEX idx_notifications_order_id ON notifications(order_id);
CREATE INDEX idx_users_email ON users(email);
