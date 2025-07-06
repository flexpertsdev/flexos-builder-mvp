<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="bg-bg-secondary rounded-lg p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        
        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
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
                class="w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full btn btn-primary mt-6"
            :disabled="loading"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else>Signing in...</span>
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-text-secondary">
            Don't have an account?
            <NuxtLink to="/signup" class="text-primary hover:underline ml-1">
              Sign up free
            </NuxtLink>
          </p>
        </div>
        
        <!-- Demo mode notice -->
        <div class="mt-6 p-4 bg-bg-tertiary rounded-lg text-sm text-text-secondary text-center">
          <p>Demo Mode: Use any email/password to continue</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  // Mock login - just simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Store fake user in localStorage
  localStorage.setItem('user', JSON.stringify({
    id: 'demo-user',
    email: email.value,
    name: email.value.split('@')[0]
  }))
  
  // Redirect to dashboard
  router.push('/dashboard')
}
</script>