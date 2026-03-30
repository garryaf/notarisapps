import faqData from '../data/faq.json'

interface FAQEntry {
  keywords: string[]
  answer: string
}

const faqEntries: FAQEntry[] = faqData

export function findAnswer(question: string): string | null {
  const lowerQuestion = question.toLowerCase()
  const words = lowerQuestion.split(/\s+/)

  let bestMatch: FAQEntry | null = null
  let bestScore = 0

  for (const entry of faqEntries) {
    let score = 0
    for (const keyword of entry.keywords) {
      if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  return bestScore > 0 ? bestMatch!.answer : null
}
