export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, initUser } = useSupabase()
  
  // Initialize user on first load
  if (process.client) {
    await initUser()
  }
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/project']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  // Check authentication after initialization
  if (isProtectedRoute && !isAuthenticated.value) {
    return navigateTo('/login')
  }
  
  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => to.path === route)
  
  if (isAuthRoute && isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})