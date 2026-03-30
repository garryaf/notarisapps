export type OrderStatus = 'pending' | 'verifikasi' | 'diproses' | 'revisi' | 'selesai'
export type UserRole = 'user' | 'admin'
export type NotificationType = 'email' | 'whatsapp'
export type NotificationStatus = 'sent' | 'failed'
export type ChatSender = 'user' | 'bot'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  notary_id: string | null
  created_at: string
}

export interface Notary {
  id: string
  name: string
  address: string
  phone: string
  email: string
  logo_url: string
  created_at: string
}

export interface Service {
  id: string
  notary_id: string
  name: string
  description: string
  price: number
  created_at: string
}

export interface Order {
  id: string
  tracking_code: string
  user_name: string
  user_email: string
  notary_id: string
  service_id: string
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  order_id: string
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
}

export interface StatusHistory {
  id: string
  order_id: string
  old_status: OrderStatus | null
  new_status: OrderStatus
  changed_by: string
  notes: string | null
  changed_at: string
}

export interface Chat {
  id: string
  order_id: string | null
  sender: ChatSender
  message: string
  created_at: string
}

export interface Notification {
  id: string
  order_id: string
  type: NotificationType
  recipient: string
  message: string
  status: NotificationStatus
  sent_at: string
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'id' | 'created_at'>; Update: Partial<Omit<User, 'id'>> }
      notaries: { Row: Notary; Insert: Omit<Notary, 'id' | 'created_at'>; Update: Partial<Omit<Notary, 'id'>> }
      services: { Row: Service; Insert: Omit<Service, 'id' | 'created_at'>; Update: Partial<Omit<Service, 'id'>> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Order, 'id'>> }
      documents: { Row: Document; Insert: Omit<Document, 'id' | 'uploaded_at'>; Update: Partial<Omit<Document, 'id'>> }
      status_histories: { Row: StatusHistory; Insert: Omit<StatusHistory, 'id' | 'changed_at'>; Update: Partial<Omit<StatusHistory, 'id'>> }
      chats: { Row: Chat; Insert: Omit<Chat, 'id' | 'created_at'>; Update: Partial<Omit<Chat, 'id'>> }
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'sent_at'>; Update: Partial<Omit<Notification, 'id'>> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
