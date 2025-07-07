<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-primary">
    <div class="w-full max-w-md">
      <div class="bg-bg-secondary rounded-xl p-8 shadow-2xl border border-border-primary">
        <h1 class="text-3xl font-bold mb-2 text-center">Start Building Today</h1>
        <p class="text-text-secondary text-center mb-8">Transform your idea into documentation</p>
        
        <form @submit.prevent="handleSignup">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">
                Name
              </label>
              <input
                v-model="name"
                type="text"
                required
                class="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="Sarah Johnson"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                v-model="password"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="At least 8 characters"
              />
              <p class="text-xs text-text-muted mt-1">Must be at least 8 characters</p>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="error" class="mt-4 p-3 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg text-sm text-error">
            {{ error }}
          </div>
          
          <button
            type="submit"
            class="w-full btn btn-primary mt-6"
            :disabled="loading"
          >
            <span v-if="!loading">Create Free Account</span>
            <span v-else>Creating account...</span>
          </button>
        </form>
        
        <!-- Social signup options -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border-primary"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-bg-secondary text-text-secondary">Or sign up with</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              @click="handleGoogleSignup"
              type="button"
              class="btn btn-secondary flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button
              @click="handleGithubSignup"
              type="button"
              class="btn btn-secondary flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-text-secondary">
            Already have an account?
            <NuxtLink to="/login" class="text-primary hover:underline ml-1">
              Sign in
            </NuxtLink>
          </p>
        </div>
        
        <div class="mt-6 text-center text-sm text-text-muted">
          <p>Free forever • No credit card required</p>
          <p class="mt-2">3 projects • 100 AI messages/month</p>
        </div>
        
        <!-- Demo mode notice -->
        <div v-if="isDemo" class="mt-6 p-4 bg-accent bg-opacity-10 border border-accent border-opacity-20 rounded-lg text-center">
          <p class="font-medium text-accent mb-2">🚀 Demo Mode Active</p>
          <p class="text-sm text-text-secondary">Use any email/password to create a demo account</p>
          <p class="text-xs text-text-muted mt-2">Your data is stored locally in this browser</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { signUp, signInWithProvider } = useSupabase()
const router = useRouter()
const { $supabase } = useNuxtApp()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isDemo = ref(!$supabase)

const handleSignup = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: signUpError } = await signUp(email.value, password.value, {
      full_name: name.value
    })
    
    if (signUpError) {
      error.value = signUpError.message
      loading.value = false
      return
    }
    
    // Check if email confirmation is required
    if (data.user && !data.session) {
      error.value = 'Please check your email to confirm your account.'
      loading.value = false
      return
    }
    
    // Successful signup - redirect to dashboard
    await navigateTo('/dashboard')
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    loading.value = false
  }
}

// Social signup handlers
const handleGoogleSignup = async () => {
  await signInWithProvider('google')
}

const handleGithubSignup = async () => {
  await signInWithProvider('github')
}
</script>