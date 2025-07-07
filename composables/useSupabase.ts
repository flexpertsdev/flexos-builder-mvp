import type { User, Session } from '@supabase/supabase-js'

export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  const user = useState<User | null>('supabase_user', () => null)
  const session = useState<Session | null>('supabase_session', () => null)
  
  // Return demo mode functions if Supabase is not configured
  if (!$supabase) {
    // Demo mode session management
    const DEMO_SESSION_KEY = 'flexos_demo_session'
    
    // Initialize demo user from localStorage
    const initDemoUser = () => {
      if (process.client) {
        const storedSession = localStorage.getItem(DEMO_SESSION_KEY)
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            user.value = parsed.user
            session.value = parsed.session
          } catch (e) {
            // Invalid session, clear it
            localStorage.removeItem(DEMO_SESSION_KEY)
          }
        }
      }
    }
    
    // Save demo session to localStorage
    const saveDemoSession = (demoUser: any) => {
      if (process.client) {
        const demoSession = {
          user: demoUser,
          session: {
            access_token: 'demo-token',
            refresh_token: 'demo-refresh',
            expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
          }
        }
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession))
        user.value = demoUser
        session.value = demoSession.session as any
      }
    }
    
    // Initialize on client
    if (process.client) {
      initDemoUser()
    }
    
    return {
      user: readonly(user),
      session: readonly(session),
      signIn: async (email: string, password: string) => {
        // Demo mode - accept any credentials
        const demoUser = {
          id: `demo-${email.replace('@', '-at-').replace('.', '-')}`,
          email,
          created_at: new Date().toISOString(),
          app_metadata: { provider: 'demo' },
          user_metadata: { full_name: email.split('@')[0] }
        } as any
        
        saveDemoSession(demoUser)
        
        return { data: { user: demoUser, session: session.value }, error: null }
      },
      signUp: async (email: string, password: string, metadata?: any) => {
        // Demo mode - accept any credentials
        const demoUser = {
          id: `demo-${email.replace('@', '-at-').replace('.', '-')}`,
          email,
          created_at: new Date().toISOString(),
          app_metadata: { provider: 'demo' },
          user_metadata: metadata || { full_name: email.split('@')[0] }
        } as any
        
        saveDemoSession(demoUser)
        
        return { data: { user: demoUser, session: session.value }, error: null }
      },
      signOut: async () => {
        user.value = null
        session.value = null
        if (process.client) {
          localStorage.removeItem(DEMO_SESSION_KEY)
        }
        return { error: null }
      },
      signInWithProvider: async (provider: string) => {
        // Demo mode - simulate OAuth
        const demoUser = {
          id: `demo-${provider}-${Date.now()}`,
          email: `user@${provider}.demo`,
          created_at: new Date().toISOString(),
          app_metadata: { provider },
          user_metadata: { full_name: `${provider} User` }
        } as any
        
        saveDemoSession(demoUser)
        
        // Simulate redirect
        if (process.client) {
          await navigateTo('/dashboard')
        }
        
        return { data: { url: '/dashboard', provider }, error: null }
      },
      getUser: async () => {
        return user.value
      },
      updateUser: async (metadata: any) => {
        if (user.value) {
          user.value = { ...user.value, user_metadata: { ...user.value.user_metadata, ...metadata } }
          saveDemoSession(user.value)
        }
        return { data: { user: user.value }, error: null }
      },
      isAuthenticated: computed(() => !!user.value),
      initUser: async () => {
        initDemoUser()
      }
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