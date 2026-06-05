'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { garantirAudioContext } from '@/lib/videoke-sound'

export function SomToggle({ somAtivo, onToggle }) {
  const handleClick = () => {
    const ctx = garantirAudioContext()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
    onToggle()
  }

  return (
    <Button variant={somAtivo ? 'default' : 'outline'} size="sm" onClick={handleClick}>
      {somAtivo ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
      Som
    </Button>
  )
}