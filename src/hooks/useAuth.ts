import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { identify, reset } from '@edgeplus/sdk'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

function syncEdgePlusIdentity(user: User | null) {
  if (user?.email) {
    identify(user.email, {
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
    })
  } else {
    reset()
  }
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  })

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setState({
        user,
        session,
        isLoading: false,
        isAdmin: user?.email === ADMIN_EMAIL,
      })
      syncEdgePlusIdentity(user)
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user ?? null
        setState({
          user,
          session,
          isLoading: false,
          isAdmin: user?.email === ADMIN_EMAIL,
        })
        if (event === 'SIGNED_OUT') {
          reset()
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          syncEdgePlusIdentity(user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  return {
    ...state,
    signIn,
    signOut,
  }
}
