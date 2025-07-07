// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    // Private keys that are exposed to the server ONLY
    // These are replaced with empty strings during build
    supabaseServiceKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    
    // Public keys that are exposed to the client
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },
  
  app: {
    head: {
      title: 'FlexOS Builder - From Idea to Documentation',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Transform your app idea into complete documentation in under 2 hours' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
