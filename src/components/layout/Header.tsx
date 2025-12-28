import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { KKOKKO } from '@/constants'

const SECRET_TAP_COUNT = 5
const SECRET_TAP_TIMEOUT = 2000

export function Header() {
  const navigate = useNavigate()
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    tapCountRef.current += 1

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
    }

    if (tapCountRef.current >= SECRET_TAP_COUNT) {
      tapCountRef.current = 0
      navigate('/login')
      return
    }

    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current < SECRET_TAP_COUNT) {
        navigate('/')
      }
      tapCountRef.current = 0
    }, SECRET_TAP_TIMEOUT)
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <button
          onClick={handleLogoClick}
          className="font-bold text-lg select-none"
        >
          {KKOKKO.SITE_NAME}
        </button>
      </div>
    </header>
  )
}
