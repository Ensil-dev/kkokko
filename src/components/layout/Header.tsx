import { Link } from 'react-router-dom'
import { KKOKKO } from '@/constants'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          {KKOKKO.SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            관리자
          </Link>
        </nav>
      </div>
    </header>
  )
}
