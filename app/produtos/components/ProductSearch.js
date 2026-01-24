'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function ProductSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="text"
            placeholder="Buscar produto por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-12 text-base sm:text-lg"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
          <Badge variant="secondary" className="flex items-center gap-1">
            Busca: "{searchQuery}"
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => setSearchQuery('')}
            />
          </Badge>
        </div>
      )}
    </div>
  )
}