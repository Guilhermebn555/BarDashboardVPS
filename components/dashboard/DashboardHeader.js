'use client'

import Link from 'next/link'
import { Coffee, DollarSign, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/logout-button'

export function DashboardHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Bar do Roldão</h1>
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
              <Link href="/mesas">
                <Coffee className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Mesas</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
              <Link href="/pix">
                <DollarSign className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">PIX</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
              <Link href="/produtos">
                <Package className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Produtos</span>
              </Link>
            </Button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}