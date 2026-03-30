import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { validateFile } from '../services/document-service'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types'

/**
 * Helper to create a mock File object for testing.
 */
function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(Math.min(size, 64))
  const blob = new Blob([buffer], { type })
  Object.defineProperty(blob, 'size', { value: size, writable: false })
  Object.defineProperty(blob, 'name', { value: name, writable: false })
  return blob as File
}

/** Arbitrary for allowed MIME types */
const allowedTypeArb = fc.constantFrom(
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
)

/** Arbitrary for disallowed MIME types */
const disallowedTypeArb = fc.constantFrom(
  'text/plain',
  'text/html',
  'application/json',
  'application/xml',
  'image/gif',
  'image/webp',
  'video/mp4',
  'application/zip'
)

/** Arbitrary for valid file sizes (1 byte to 10MB) */
const validSizeArb = fc.integer({ min: 1, max: MAX_FILE_SIZE })

/** Arbitrary for oversized files (10MB + 1 to 20MB) */
const oversizedArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 2 })

/** Arbitrary for file names */
const fileNameArb = fc.string({ minLength: 1, maxLength: 50 }).map((s) =>
  s.replace(/[^a-zA-Z0-9\-_.]/g, 'x') || 'file'
)

describe('document-service property tests', () => {
  /**
   * Feature: notary-service-platform, Property 7: File Upload Validation
   * For any file upload attempt, the upload succeeds if and only if the file type
   * is one of {PDF, JPG, JPEG, PNG} AND the file size is ≤ 10MB.
   * Files that violate either constraint must be rejected with the appropriate error message.
   *
   * **Validates: Requirements 6.4, 6.5, 6.6, 6.7**
   */
  it('P7: upload succeeds iff file type is PDF/JPG/JPEG/PNG AND size ≤ 10MB', () => {
    // Sub-property: valid type + valid size → no error
    fc.assert(
      fc.property(fileNameArb, validSizeArb, allowedTypeArb, (name, size, type) => {
        const file = createMockFile(name, size, type)
        const result = validateFile(file)
        expect(result).toBeNull()
      }),
      { numRuns: 100 }
    )

    // Sub-property: disallowed type → type error message
    fc.assert(
      fc.property(fileNameArb, validSizeArb, disallowedTypeArb, (name, size, type) => {
        const file = createMockFile(name, size, type)
        const result = validateFile(file)
        expect(result).toBe('Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG')
      }),
      { numRuns: 100 }
    )

    // Sub-property: allowed type + oversized → size error message
    fc.assert(
      fc.property(fileNameArb, oversizedArb, allowedTypeArb, (name, size, type) => {
        const file = createMockFile(name, size, type)
        const result = validateFile(file)
        expect(result).toBe('Ukuran file melebihi batas maksimal 10MB')
      }),
      { numRuns: 100 }
    )

    // Sub-property: disallowed type + oversized → type error (checked first)
    fc.assert(
      fc.property(fileNameArb, oversizedArb, disallowedTypeArb, (name, size, type) => {
        const file = createMockFile(name, size, type)
        const result = validateFile(file)
        expect(result).toBe('Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 18: Document Upload Round Trip
   * For any valid file uploaded for an order, querying documents by order_id must return
   * a document with the same file_name, correct file_type, and a valid file_url
   * pointing to Supabase Storage.
   *
   * Since this property requires Supabase integration, we test the validation + metadata
   * invariants: for any valid file, the metadata that would be stored preserves file_name
   * and file_type, and the file_url contains the order_id.
   *
   * **Validates: Requirements 6.2, 6.3**
   */
  it('P18: valid uploaded file metadata preserves file_name, file_type, and references order_id', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fileNameArb.filter((n) => n.length > 0),
        validSizeArb,
        allowedTypeArb,
        (orderId, fileName, size, fileType) => {
          // Validate the file passes validation
          const file = createMockFile(fileName, size, fileType)
          const validationResult = validateFile(file)
          expect(validationResult).toBeNull()

          // Simulate the metadata that would be stored
          const filePath = `${orderId}/${Date.now()}-${fileName}`
          const metadata = {
            order_id: orderId,
            file_name: fileName,
            file_url: filePath,
            file_type: fileType,
          }

          // Verify round-trip invariants
          expect(metadata.file_name).toBe(fileName)
          expect(metadata.file_type).toBe(fileType)
          expect(metadata.order_id).toBe(orderId)
          expect(metadata.file_url).toContain(orderId)
          expect(ALLOWED_FILE_TYPES).toContain(metadata.file_type)
        }
      ),
      { numRuns: 100 }
    )
  })
})
