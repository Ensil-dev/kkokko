import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { LoginForm } from '@/components/auth'

export function LoginPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  // 이미 로그인된 경우 관리자 페이지로 리다이렉트
  if (user) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <LoginForm />
    </div>
  )
}
