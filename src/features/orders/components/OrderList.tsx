'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { StatusBadge } from './StatusBadge'
import { getAll } from '../services/order-service'
import { getAll as getAllNotaries } from '@/features/notaries/services/notary-service'
import type { Order, OrderStatus } from '../types'
import type { Notary } from '@/types/database'

interface OrderListProps {
  onSelect?: (order: Order) => void
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'verifikasi', 'diproses', 'revisi', 'selesai']

export function OrderList({ onSelect }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterNotary, setFilterNotary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAllNotaries().then(setNotaries).catch(() => {})
  }, [])

  useEffect(() => {
    setIsLoading(true)
    getAll({
      status: filterStatus ? (filterStatus as OrderStatus) : undefined,
      notaryId: filterNotary || undefined,
    })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [filterStatus, filterNotary])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label htmlFor="filter-status" className="text-sm font-medium">
            Filter Status
          </label>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? '')}>
            <SelectTrigger id="filter-status" aria-label="Filter Status" className="w-[180px]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua status</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label htmlFor="filter-notary" className="text-sm font-medium">
            Filter Notaris
          </label>
          <Select value={filterNotary} onValueChange={(v) => setFilterNotary(v ?? '')}>
            <SelectTrigger id="filter-notary" aria-label="Filter Notaris" className="w-[200px]">
              <SelectValue placeholder="Semua notaris" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua notaris</SelectItem>
              {notaries.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Memuat data...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Tidak ada pesanan ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking Code</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`Pesanan ${order.tracking_code}`}
                  onClick={() => onSelect?.(order)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect?.(order)
                    }
                  }}
                >
                  <TableCell className="font-mono">{order.tracking_code}</TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>{order.user_email}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
