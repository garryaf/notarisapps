'use client'

import { MapPin } from 'lucide-react'
import type { Notary } from '../types'

interface NotaryCardProps {
  notary: Notary
  onClick?: (notary: Notary) => void
}

export function NotaryCard({ notary, onClick }: NotaryCardProps) {
  return (
    <div
      className="glass p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
      onClick={() => onClick?.(notary)}
      role="button"
      tabIndex={0}
      aria-label={`Notaris ${notary.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(notary)
        }
      }}
    >
      <div className="flex items-center gap-4 mb-3">
        {notary.logo_url && (
          <img
            src={notary.logo_url}
            alt={`Logo ${notary.name}`}
            className="w-12 h-12 rounded-full object-cover border border-white/10"
          />
        )}
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#EAE3D2]">
            {notary.name}
          </h3>
          {notary.region && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#1F2A24]/60 text-xs text-[#EAE3D2]/80 border border-white/10">
              <MapPin className="h-3 w-3" />
              {notary.region}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-[#8a8070]">{notary.address}</p>
    </div>
  )
}
