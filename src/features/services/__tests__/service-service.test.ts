import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { getByNotaryId, getById, create, update } from '../services/service-service'

const mockService = {
  id: 'svc-1',
  notary_id: 'notary-1',
  name: 'Akta Jual Beli',
  description: 'Pembuatan akta jual beli properti',
  price: 500000,
  created_at: '2025-01-01T00:00:00Z',
}

describe('service-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByNotaryId', () => {
    it('should return services for a specific notary', async () => {
      const services = [mockService, { ...mockService, id: 'svc-2', name: 'Legalisasi' }]

      mockOrder.mockResolvedValue({ data: services, error: null })
      mockEq.mockReturnValue({ order: mockOrder })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getByNotaryId('notary-1')

      expect(result).toEqual(services)
      expect(mockFrom).toHaveBeenCalledWith('services')
      expect(mockEq).toHaveBeenCalledWith('notary_id', 'notary-1')
    })

    it('should return empty array when notary has no services', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null })
      mockEq.mockReturnValue({ order: mockOrder })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getByNotaryId('notary-empty')

      expect(result).toEqual([])
    })

    it('should throw error on database failure', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })
      mockEq.mockReturnValue({ order: mockOrder })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      await expect(getByNotaryId('notary-1')).rejects.toThrow('DB error')
    })
  })

  describe('getById', () => {
    it('should return a service by id', async () => {
      mockSingle.mockResolvedValue({ data: mockService, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getById('svc-1')

      expect(result).toEqual(mockService)
      expect(mockFrom).toHaveBeenCalledWith('services')
      expect(mockEq).toHaveBeenCalledWith('id', 'svc-1')
    })

    it('should return null when service not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new service', async () => {
      mockSingle.mockResolvedValue({ data: mockService, error: null })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockInsert.mockReturnValue({ select: mockSelect })
      mockFrom.mockReturnValue({ insert: mockInsert })

      const input = {
        notary_id: 'notary-1',
        name: 'Akta Jual Beli',
        description: 'Pembuatan akta jual beli properti',
        price: 500000,
      }

      const result = await create(input)

      expect(result).toEqual(mockService)
      expect(mockInsert).toHaveBeenCalledWith(input)
    })

    it('should throw error on creation failure', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockInsert.mockReturnValue({ select: mockSelect })
      mockFrom.mockReturnValue({ insert: mockInsert })

      await expect(
        create({
          notary_id: 'notary-1',
          name: 'Test',
          description: 'Test',
          price: 100,
        })
      ).rejects.toThrow('Insert failed')
    })
  })

  describe('update', () => {
    it('should update an existing service', async () => {
      const updated = { ...mockService, name: 'Updated Service' }

      mockSingle.mockResolvedValue({ data: updated, error: null })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockEq.mockReturnValue({ select: mockSelect })
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ update: mockUpdate })

      const result = await update('svc-1', { name: 'Updated Service' })

      expect(result).toEqual(updated)
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Service' })
      expect(mockEq).toHaveBeenCalledWith('id', 'svc-1')
    })

    it('should throw error on update failure', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Update failed' } })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockEq.mockReturnValue({ select: mockSelect })
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ update: mockUpdate })

      await expect(update('svc-1', { name: 'Test' })).rejects.toThrow('Update failed')
    })
  })

  describe('notary scoping', () => {
    it('should only return services belonging to the queried notary', async () => {
      const notary1Services = [
        { ...mockService, id: 'svc-1', notary_id: 'notary-1' },
        { ...mockService, id: 'svc-2', notary_id: 'notary-1' },
      ]

      mockOrder.mockResolvedValue({ data: notary1Services, error: null })
      mockEq.mockReturnValue({ order: mockOrder })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getByNotaryId('notary-1')

      expect(result.length).toBe(2)
      result.forEach((service) => {
        expect(service.notary_id).toBe('notary-1')
      })
    })

    it('should create service with correct notary_id', async () => {
      const newService = { ...mockService, notary_id: 'notary-2' }

      mockSingle.mockResolvedValue({ data: newService, error: null })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockInsert.mockReturnValue({ select: mockSelect })
      mockFrom.mockReturnValue({ insert: mockInsert })

      const result = await create({
        notary_id: 'notary-2',
        name: 'Test Service',
        description: 'Test',
        price: 100000,
      })

      expect(result.notary_id).toBe('notary-2')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ notary_id: 'notary-2' })
      )
    })
  })
})
