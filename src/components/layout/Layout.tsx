import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      {!isHomePage && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
