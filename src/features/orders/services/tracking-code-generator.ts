const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateTrackingCode(): string {
  const date = new Date()
  const yyyy = date.getFullYear().toString()
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const dateStr = `${yyyy}${mm}${dd}`

  let random = ''
  for (let i = 0; i < 6; i++) {
    random += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }

  return `ORD-${dateStr}-${random}`
}
