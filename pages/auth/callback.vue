<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-primary">
    <div class="w-full max-w-md">
      <div class="bg-bg-secondary rounded-xl p-8 shadow-2xl border border-border-primary text-center">
        <div v-if="loading" class="space-y-4">
          <div class="w-16 h-16 mx-auto">
            <svg class="animate-spin text-primary" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-lg">Authenticating...</p>
          <p class="text-sm text-text-secondary">Please wait while we complete your sign in</p>
        </div>
        
        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 mx-auto text-error">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold">Authentication Failed</h2>
          <p class="text-text-secondary">{{ error }}</p>
          <NuxtLink to="/login" class="btn btn-primary inline-block mt-4">
            Back to Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const error = ref('')
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // Check for error in query params
  if (route.query.error) {
    loading.value = false
    error.value = route.query.error_description || 'An error occurred during authentication'
    return
  }
  
  // Handle successful OAuth callback
  try {
    // Supabase automatically handles the callback and sets the session
    // We just need to wait a bit for the session to be established
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user is authenticated
    const { isAuthenticated, initUser } = useSupabase()
    await initUser()
    
    if (isAuthenticated.value) {
      // Redirect to dashboard
      await navigateTo('/dashboard')
    } else {
      throw new Error('Authentication failed. Please try again.')
    }
  } catch (err) {
    loading.value = false
    error.value = err.message || 'An unexpected error occurred'
  }
})
</script>