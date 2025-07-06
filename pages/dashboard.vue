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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '~/composables/useStorage'

// Use auth middleware
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const storage = useStorage()

// Projects from localStorage
const projects = ref([])

// Calculate relative time
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

// Calculate project progress based on completed items
const calculateProgress = (projectId) => {
  const features = storage.getFeatures(projectId)
  const pages = storage.getPages(projectId)
  const journeys = storage.getJourneys(projectId)
  const conversations = storage.getConversations(projectId)
  
  // Simple progress calculation
  let progress = 0
  if (conversations.length > 0) progress += 20
  if (features.length > 0) progress += 30
  if (pages.length > 0) progress += 25
  if (journeys.length > 0) progress += 25
  
  return Math.min(progress, 100)
}

// Load projects on mount
onMounted(() => {
  const user = storage.getUser()
  if (!user) {
    router.push('/login')
    return
  }
  
  // Load all projects
  const storedProjects = storage.getProjects()
  
  // If no projects exist, create some demo projects
  if (storedProjects.length === 0) {
    // Create demo project 1
    const jewelryProject = {
      id: 'jewelry-store',
      name: 'Handmade Jewelry Store',
      description: 'Online marketplace for artisan jewelry with inventory tracking and custom orders',
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    }
    storage.saveProject(jewelryProject)
    
    // Add some demo conversations
    storage.saveConversation('jewelry-store', {
      id: 'msg-1',
      role: 'user',
      content: 'I want to build an online store for my handmade jewelry'
    })
    storage.saveConversation('jewelry-store', {
      id: 'msg-2',
      role: 'assistant',
      content: 'That sounds wonderful! Let me help you build your handmade jewelry store. Can you tell me more about your jewelry? What kinds of pieces do you make?'
    })
    
    // Add some demo features
    storage.saveFeature('jewelry-store', {
      id: 'feat-1',
      name: 'Product Gallery',
      description: 'Beautiful grid display of jewelry pieces with zoom on hover'
    })
    storage.saveFeature('jewelry-store', {
      id: 'feat-2',
      name: 'Inventory Tracking',
      description: 'Track limited quantities and show "Only X left" indicators'
    })
    
    // Create demo project 2
    const restaurantProject = {
      id: 'restaurant-booking',
      name: 'Restaurant Booking System',
      description: 'Table reservations with SMS confirmations and waitlist management',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
    storage.saveProject(restaurantProject)
    
    // Reload projects
    projects.value = storage.getProjects()
  } else {
    projects.value = storedProjects
  }
  
  // Enhance projects with calculated data
  projects.value = projects.value.map(project => ({
    ...project,
    progress: calculateProgress(project.id),
    lastUpdated: getRelativeTime(project.updatedAt)
  }))
})

const openProject = (projectId) => {
  storage.setCurrentProjectId(projectId)
  router.push(`/project/${projectId}`)
}

const createNewProject = () => {
  // For MVP, just create a new project with a random ID
  const newProjectId = `project-${Date.now()}`
  const newProject = {
    id: newProjectId,
    name: 'New Project',
    description: 'Click to start your discovery conversation'
  }
  storage.saveProject(newProject)
  storage.setCurrentProjectId(newProjectId)
  router.push(`/project/${newProjectId}`)
}

const handleLogout = () => {
  storage.clearUser()
  router.push('/')
}
</script>