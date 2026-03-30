import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { sendMessage, DEFAULT_FALLBACK_MESSAGE } from '../services/chat-service'

/**
 * Helper: collects all saved chat messages during a sendMessage call.
 */
function createMockSaveChat() {
  const saved: Array<{ sender: 'user' | 'bot'; message: string; orderId?: string }> = []
  const fn = async (sender: 'user' | 'bot', message: string, orderId?: string) => {
    saved.push({ sender, message, orderId })
  }
  return { fn, saved }
}

/** Arbitrary for non-empty user messages */
const messageArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)

/** Arbitrary for optional order IDs */
const orderIdArb = fc.option(fc.uuid(), { nil: undefined })

describe('chat-service property tests', () => {
  /**
   * Feature: notary-service-platform, Property 11: Chatbot FAQ Priority
   *
   * For any user message, if the FAQ store contains a matching answer, the chatbot
   * must return the FAQ answer (not the AI fallback). If the FAQ store has no match,
   * the chatbot must attempt the AI fallback. If AI fails, the chatbot must return
   * the default fallback message.
   *
   * **Validates: Requirements 10.2, 10.3, 10.4, 10.6**
   */
  it('P11: FAQ match returns FAQ answer; no match tries AI; AI failure returns default', async () => {
    const faqAnswer = 'This is the FAQ answer'
    const aiAnswer = 'This is the AI answer'

    // Sub-property 1: When FAQ has a match, return FAQ answer (not AI)
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        const result = await sendMessage(message, orderId, {
          faqFindAnswer: () => faqAnswer,
          aiGetResponse: async () => aiAnswer,
          saveChat: mockSave.fn,
        })

        expect(result.source).toBe('faq')
        expect(result.message).toBe(faqAnswer)
        expect(result.sender).toBe('bot')
        // Should NOT be the AI answer
        expect(result.message).not.toBe(aiAnswer)
      }),
      { numRuns: 100 }
    )

    // Sub-property 2: When FAQ has no match, try AI
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        const result = await sendMessage(message, orderId, {
          faqFindAnswer: () => null,
          aiGetResponse: async () => aiAnswer,
          saveChat: mockSave.fn,
        })

        expect(result.source).toBe('ai')
        expect(result.message).toBe(aiAnswer)
        expect(result.sender).toBe('bot')
      }),
      { numRuns: 100 }
    )

    // Sub-property 3: When FAQ has no match AND AI fails, return default
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        const result = await sendMessage(message, orderId, {
          faqFindAnswer: () => null,
          aiGetResponse: async () => { throw new Error('AI unavailable') },
          saveChat: mockSave.fn,
        })

        expect(result.source).toBe('default')
        expect(result.message).toBe(DEFAULT_FALLBACK_MESSAGE)
        expect(result.sender).toBe('bot')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 12: Chat History Persistence
   *
   * For any chatbot interaction (user message + bot response), both messages must
   * be persisted to the chats table with correct sender values ("user" and "bot"
   * respectively).
   *
   * **Validates: Requirements 10.5**
   */
  it('P12: both user message and bot response are persisted with correct sender values', async () => {
    // Sub-property 1: FAQ path persists both messages
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        await sendMessage(message, orderId, {
          faqFindAnswer: () => 'FAQ answer',
          aiGetResponse: async () => 'AI answer',
          saveChat: mockSave.fn,
        })

        // Exactly 2 messages saved: user + bot
        expect(mockSave.saved.length).toBe(2)
        expect(mockSave.saved[0].sender).toBe('user')
        expect(mockSave.saved[0].message).toBe(message)
        expect(mockSave.saved[1].sender).toBe('bot')
        expect(mockSave.saved[1].message).toBe('FAQ answer')
      }),
      { numRuns: 100 }
    )

    // Sub-property 2: AI path persists both messages
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        await sendMessage(message, orderId, {
          faqFindAnswer: () => null,
          aiGetResponse: async () => 'AI response',
          saveChat: mockSave.fn,
        })

        expect(mockSave.saved.length).toBe(2)
        expect(mockSave.saved[0].sender).toBe('user')
        expect(mockSave.saved[0].message).toBe(message)
        expect(mockSave.saved[1].sender).toBe('bot')
        expect(mockSave.saved[1].message).toBe('AI response')
      }),
      { numRuns: 100 }
    )

    // Sub-property 3: Default fallback path persists both messages
    await fc.assert(
      fc.asyncProperty(messageArb, orderIdArb, async (message, orderId) => {
        const mockSave = createMockSaveChat()
        await sendMessage(message, orderId, {
          faqFindAnswer: () => null,
          aiGetResponse: async () => { throw new Error('fail') },
          saveChat: mockSave.fn,
        })

        expect(mockSave.saved.length).toBe(2)
        expect(mockSave.saved[0].sender).toBe('user')
        expect(mockSave.saved[0].message).toBe(message)
        expect(mockSave.saved[1].sender).toBe('bot')
        expect(mockSave.saved[1].message).toBe(DEFAULT_FALLBACK_MESSAGE)
      }),
      { numRuns: 100 }
    )
  })
})
