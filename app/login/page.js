'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { LoginForm } from './components/LoginForm'
import { LoginBackground } from './components/LoginBackground'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-4 relative">
      <LoginBackground />
      
      <Suspense fallback={
        <div className="text-center relative z-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}