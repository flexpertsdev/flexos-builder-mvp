import type { User, Session } from '@supabase/supabase-js'

export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  const user = useState<User | null>('supabase_user', () => null)
  const session = useState<Session | null>('supabase_session', () => null)
  
  // Return demo mode functions if Supabase is not configured
  if (!$supabase) {
    return {
      user: readonly(user),
      session: readonly(session),
      signIn: async (email: string, password: string) => {
        // Demo mode - accept any credentials
        user.value = {
          id: `demo-${Date.now()}`,
          email,
          created_at: new Date().toISOString()
        } as any
        return { data: { user: user.value, session: {} }, error: null }
      },
      signUp: async (email: string, password: string) => {
        // Demo mode - accept any credentials
        user.value = {
          id: `demo-${Date.now()}`,
          email,
          created_at: new Date().toISOString()
        } as any
        return { data: { user: user.value, session: {} }, error: null }
      },
      signOut: async () => {
        user.value = null
        session.value = null
        return { error: null }
      },
      isAuthenticated: computed(() => !!user.value)
    }
  }
  
  // Initialize user state
  const initUser = async () => {
    const { data: { session: currentSession } } = await $supabase.auth.getSession()
    if (currentSession) {
      session.value = currentSession
      user.value = currentSession.user
    }
  }
  
  // Set up auth state listener
  $supabase.auth.onAuthStateChange((event, currentSession) => {
    session.value = currentSession
    user.value = currentSession?.user || null
  })
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await $supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (data.session) {
      session.value = data.session
      user.value = data.user
    }
    
    return { data, error }
  }
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await $supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (data.session) {
      session.value = data.session
      user.value = data.user
    }
    
    return { data, error }
  }
  
  // Sign out
  const signOut = async () => {
    const { error } = await $supabase.auth.signOut()
    if (!error) {
      user.value = null
      session.value = null
    }
    return { error }
  }
  
  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { data, error } = await $supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }
  
  // Get current user
  const getUser = async () => {
    const { data: { user: currentUser } } = await $supabase.auth.getUser()
    user.value = currentUser
    return currentUser
  }
  
  // Update user metadata
  const updateUser = async (metadata: any) => {
    const { data, error } = await $supabase.auth.updateUser({
      data: metadata
    })
    
    if (data.user) {
      user.value = data.user
    }
    
    return { data, error }
  }
  
  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)
  
  // Initialize on mount
  if (process.client) {
    initUser()
  }
  
  return {
    user: readonly(user),
    session: readonly(session),
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    getUser,
    updateUser,
    isAuthenticated,
    initUser
  }
}