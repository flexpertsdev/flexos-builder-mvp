<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-6"
    @click.self="$emit('close')"
  >
    <div class="bg-bg-secondary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-border-primary flex items-center justify-between">
        <h2 class="text-2xl font-bold">Your Projects</h2>
        <button
          @click="$emit('close')"
          class="text-text-secondary hover:text-text-primary transition-colors text-2xl"
        >
          ×
        </button>
      </div>
      
      <!-- Projects grid -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Project cards -->
          <div 
            v-for="project in projects" 
            :key="project.id"
            @click="switchProject(project.id)"
            :class="[
              'card cursor-pointer hover:transform hover:scale-[1.02] transition-all',
              currentProjectId === project.id ? 'ring-2 ring-primary' : ''
            ]"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-semibold">{{ project.name }}</h3>
              <span v-if="currentProjectId === project.id" class="text-xs bg-primary text-white px-2 py-1 rounded">
                Current
              </span>
            </div>
            
            <p class="text-sm text-text-secondary mb-3">{{ project.description }}</p>
            
            <!-- Progress indicator -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary transition-all duration-500"
                    :style="`width: ${project.progress || 0}%`"
                  ></div>
                </div>
              </div>
              <span class="ml-3 text-sm text-text-secondary">{{ project.progress || 0 }}%</span>
            </div>
            
            <p class="text-xs text-text-muted mt-3">
              Last updated: {{ formatRelativeTime(project.updatedAt) }}
            </p>
          </div>
          
          <!-- New project card -->
          <div
            @click="createNewProject"
            class="card cursor-pointer border-2 border-dashed border-border-secondary hover:border-primary transition-all flex items-center justify-center min-h-[160px]"
          >
            <div class="text-center">
              <div class="text-4xl mb-3 text-text-muted">+</div>
              <p class="text-sm font-medium">Start New Project</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-6 border-t border-border-primary bg-bg-tertiary">
        <div class="flex items-center justify-between">
          <p class="text-sm text-text-secondary">
            Press <kbd class="px-2 py-0.5 bg-bg-quaternary rounded text-xs">Cmd+K</kbd> to open this anytime
          </p>
          <button
            @click="$emit('close')"
            class="btn btn-secondary text-sm"
          >
            Continue Working
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '~/composables/useStorage'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentProjectId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'switch'])

const router = useRouter()
const storage = useStorage()
const projects = ref([])

// Load projects with progress
const loadProjects = () => {
  const allProjects = storage.getProjects()
  
  projects.value = allProjects.map(project => {
    const features = storage.getFeatures(project.id)
    const pages = storage.getPages(project.id)
    const conversations = storage.getConversations(project.id)
    
    // Simple progress calculation
    let progress = 0
    if (conversations.length > 0) progress += 20
    if (features.length > 0) progress += 30
    if (pages.length > 0) progress += 25
    if (features.length >= 5) progress += 25
    
    return {
      ...project,
      progress: Math.min(progress, 100)
    }
  })
}

// Switch to a different project
const switchProject = (projectId) => {
  if (projectId !== props.currentProjectId) {
    storage.setCurrentProjectId(projectId)
    router.push(`/project/${projectId}`)
    emit('switch', projectId)
  }
  emit('close')
}

// Create new project
const createNewProject = () => {
  const newProjectId = `project-${Date.now()}`
  const newProject = {
    id: newProjectId,
    name: 'New Project',
    description: 'Click to start your discovery conversation'
  }
  storage.saveProject(newProject)
  storage.setCurrentProjectId(newProjectId)
  router.push(`/project/${newProjectId}`)
  emit('close')
}

// Format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Keyboard shortcut
const handleKeyboard = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    emit('close') // Toggle
  }
}

onMounted(() => {
  loadProjects()
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

// Reload projects when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadProjects()
  }
})
</script>

<style scoped>
kbd {
  font-family: monospace;
  font-weight: 600;
  border: 1px solid var(--border-primary);
}
</style>