'use client'

import { useEffect } from 'react'

export function useConfirmExit(shouldWarn = true) {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (shouldWarn) {
        event.preventDefault()
        event.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldWarn])
}