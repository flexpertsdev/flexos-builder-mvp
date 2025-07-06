export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.client) {
    const user = localStorage.getItem('user')
    
    // Protected routes
    const protectedRoutes = ['/dashboard', '/project']
    const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
    
    if (isProtectedRoute && !user) {
      return navigateTo('/login')
    }
  }
})