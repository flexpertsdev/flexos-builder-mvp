import { useStorage } from '~/composables/useStorage'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.client) {
    const storage = useStorage()
    const user = storage.getUser()
    
    // Protected routes
    const protectedRoutes = ['/dashboard', '/project']
    const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
    
    if (isProtectedRoute && !user) {
      return navigateTo('/login')
    }
  }
})