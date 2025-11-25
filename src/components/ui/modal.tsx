import { useEffect } from 'react'
import { Card, CardContent } from './card'
import { Button } from './button'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          {children}
          <Button onClick={onClose} className="w-full mt-4">
            확인
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
