import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChatbotWidget } from '@/features/chat/components/ChatbotWidget'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  )
}
