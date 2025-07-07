export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    configured: !!config.public.supabaseUrl && !!config.public.supabaseAnonKey,
    url: config.public.supabaseUrl ? 'Configured' : 'Not configured',
    hasAnonKey: !!config.public.supabaseAnonKey,
    hasServiceKey: !!config.supabaseServiceKey
  }
})