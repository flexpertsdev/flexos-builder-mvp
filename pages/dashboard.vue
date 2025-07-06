<template>
  <div class="min-h-screen">
    <!-- Simple header -->
    <header class="bg-bg-secondary border-b border-border-primary">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">FlexOS Builder</h1>
        
        <button 
          @click="handleLogout"
          class="text-text-secondary hover:text-text-primary transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
    
    <!-- Dashboard content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">Your Projects</h2>
        <p class="text-text-secondary">Continue where you left off or start something new</p>
      </div>
      
      <!-- Projects grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Existing projects -->
        <div 
          v-for="project in projects" 
          :key="project.id"
          @click="openProject(project.id)"
          class="card cursor-pointer hover:transform hover:scale-[1.02] transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-xl font-semibold">{{ project.name }}</h3>
            <span class="text-sm text-text-muted">{{ project.lastUpdated }}</span>
          </div>
          
          <p class="text-text-secondary mb-4">{{ project.description }}</p>
          
          <!-- Progress indicator -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary transition-all duration-500"
                  :style="`width: ${project.progress}%`"
                ></div>
              </div>
            </div>
            <span class="ml-4 text-sm text-text-secondary">{{ project.progress }}%</span>
          </div>
        </div>
        
        <!-- New project card -->
        <div
          @click="createNewProject"
          class="card cursor-pointer border-2 border-dashed border-border-secondary hover:border-primary transition-all flex items-center justify-center min-h-[200px]"
        >
          <div class="text-center">
            <div class="text-5xl mb-4 text-text-muted">+</div>
            <p class="text-lg font-medium">Start New Project</p>
            <p class="text-sm text-text-secondary mt-2">Transform your idea into documentation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Use auth middleware
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

// Mock projects data
const projects = ref([
  {
    id: 'jewelry-store',
    name: 'Handmade Jewelry Store',
    description: 'Online marketplace for artisan jewelry with inventory tracking and custom orders',
    progress: 70,
    lastUpdated: '2 hours ago'
  },
  {
    id: 'restaurant-booking',
    name: 'Restaurant Booking System',
    description: 'Table reservations with SMS confirmations and waitlist management',
    progress: 45,
    lastUpdated: 'Yesterday'
  }
])

// Check if user is logged in
onMounted(() => {
  const user = localStorage.getItem('user')
  if (!user) {
    router.push('/login')
  }
})

const openProject = (projectId) => {
  router.push(`/project/${projectId}`)
}

const createNewProject = () => {
  // For MVP, just create a new project with a random ID
  const newProjectId = `project-${Date.now()}`
  router.push(`/project/${newProjectId}`)
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}
</script>