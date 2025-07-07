<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <div class="bg-bg-secondary border-b border-border-primary px-8 py-4 sticky top-0 z-10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="$router.back()"
            class="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">{{ feature?.name || 'Loading...' }}</h1>
            <span 
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-semibold',
                statusClasses[feature?.status || 'planned']
              ]"
            >
              {{ formatStatus(feature?.status) }}
            </span>
          </div>
        </div>
        <div class="flex gap-3 relative">
          <button class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit
          </button>
          <button @click="showStatusMenu = !showStatusMenu" class="btn btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Update Status
          </button>
          
          <!-- Status dropdown -->
          <div 
            v-if="showStatusMenu" 
            class="absolute top-full right-0 mt-2 bg-bg-secondary border border-border-primary rounded-lg shadow-lg overflow-hidden z-20"
          >
            <button
              v-for="status in ['planned', 'in-progress', 'done']"
              :key="status"
              @click="updateStatus(status)"
              class="w-full px-4 py-2 text-left hover:bg-bg-tertiary transition-colors text-sm"
            >
              {{ formatStatus(status) }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <!-- Left column -->
      <div class="space-y-6">
        <!-- Overview card -->
        <div class="bg-bg-secondary border border-border-primary rounded-xl p-8">
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
            <div>
              <h2 class="text-xl font-semibold mb-4">Feature Overview</h2>
              <p class="text-text-secondary leading-relaxed mb-6">
                {{ feature?.description || 'No description provided yet.' }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in feature?.tags || []" 
                  :key="tag"
                  class="px-3 py-1 bg-bg-tertiary border border-border-primary rounded-xl text-xs text-text-secondary"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Progress visualization -->
            <FeatureProgress 
              :progress="progress"
              :completedTasks="completedTasksCount"
              :totalTasks="tasks.length"
            />
          </div>
        </div>
        
        <!-- Requirements & Tasks -->
        <div class="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
          <div class="p-6 border-b border-border-primary flex items-center justify-between">
            <h3 class="text-lg font-semibold">Requirements & Tasks</h3>
            <button 
              @click="showAddTask = true"
              class="btn btn-secondary text-sm px-3 py-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
              </svg>
              Add Task
            </button>
          </div>
          
          <TaskList 
            :tasks="tasks"
            @toggle="toggleTask"
            @update="updateTask"
            @delete="deleteTask"
          />
        </div>
      </div>
      
      <!-- Right column -->
      <FeatureSidebar
        :dependencies="feature?.dependencies || []"
        :team="feature?.team || []"
        :timeline="feature?.timeline || []"
        :createdAt="feature?.createdAt"
        :updatedAt="feature?.updatedAt"
        :estimatedEffort="feature?.estimatedEffort"
        @navigate-dependency="navigateToDependency"
      />
    </div>
    
    <!-- Add Task Modal -->
    <div v-if="showAddTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-bg-secondary rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Add New Task</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-2">Task Title</label>
            <input 
              v-model="newTask.title"
              type="text"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
              placeholder="Enter task title..."
            />
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Description</label>
            <textarea 
              v-model="newTask.description"
              rows="3"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none resize-none"
              placeholder="Enter task description..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Priority</label>
            <select 
              v-model="newTask.priority"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="addTask"
            class="btn btn-primary flex-1"
          >
            Add Task
          </button>
          <button 
            @click="showAddTask = false"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '~/composables/useStorage'
import FeatureProgress from '~/components/FeatureProgress.vue'
import TaskList from '~/components/TaskList.vue'
import FeatureSidebar from '~/components/FeatureSidebar.vue'

const route = useRoute()
const router = useRouter()
const storage = useStorage()

// Feature data
const projectId = computed(() => route.params.id)
const featureId = computed(() => route.params.featureId)
const feature = ref(null)
const tasks = ref([])

// UI state
const showStatusMenu = ref(false)
const showAddTask = ref(false)
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium'
})

// Status styling
const statusClasses = {
  'planned': 'bg-info bg-opacity-20 text-info',
  'in-progress': 'bg-warning bg-opacity-20 text-warning',
  'done': 'bg-success bg-opacity-20 text-success'
}

// Computed values
const completedTasksCount = computed(() => 
  tasks.value.filter(task => task.completed).length
)

const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasksCount.value / tasks.value.length) * 100)
})

// Load feature data
const loadFeatureData = () => {
  // Get feature from storage
  const features = storage.getFeatures(projectId.value)
  feature.value = features.find(f => f.id === featureId.value)
  
  if (!feature.value) {
    // Navigate back if feature not found
    router.back()
    return
  }
  
  // Initialize with example data if not already set
  if (!feature.value.status) feature.value.status = 'in-progress'
  if (!feature.value.tags) feature.value.tags = ['Security', 'OAuth', '2FA', 'JWT']
  if (!feature.value.dependencies) {
    feature.value.dependencies = [
      { id: 'dep-1', name: 'Database Schema', completed: true },
      { id: 'dep-2', name: 'Email Service', completed: true },
      { id: 'dep-3', name: 'SMS Provider', completed: false }
    ]
  }
  if (!feature.value.team) {
    feature.value.team = [
      { id: 'member-1', name: 'John Doe', role: 'Backend Developer', initials: 'JD', color: 'bg-primary' },
      { id: 'member-2', name: 'Sarah Chen', role: 'Frontend Developer', initials: 'SC', color: 'bg-info' },
      { id: 'member-3', name: 'Alex Kim', role: 'Security Specialist', initials: 'AK', color: 'bg-warning' }
    ]
  }
  if (!feature.value.timeline) {
    feature.value.timeline = [
      { id: 'mile-1', title: 'Planning & Design', status: 'completed', date: 'Completed - Nov 15' },
      { id: 'mile-2', title: 'Backend Development', status: 'completed', date: 'Completed - Nov 22' },
      { id: 'mile-3', title: 'Frontend Integration', status: 'current', date: 'In Progress - Due Nov 29' },
      { id: 'mile-4', title: 'Testing & QA', status: 'pending', date: 'Planned - Dec 1-5' },
      { id: 'mile-5', title: 'Deployment', status: 'pending', date: 'Planned - Dec 6' }
    ]
  }
  
  // Load tasks from storage or initialize defaults
  const storedTasks = feature.value.tasks || []
  
  if (storedTasks.length === 0) {
    // Initialize with example tasks
    tasks.value = [
      {
        id: `task-${Date.now()}-1`,
        title: 'Set up authentication backend',
        description: 'Configure JWT tokens, session management, and secure password hashing',
        completed: true,
        priority: 'high',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `task-${Date.now()}-2`,
        title: 'Design login and registration forms',
        description: 'Create responsive UI components with validation feedback',
        completed: true,
        priority: 'medium',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `task-${Date.now()}-3`,
        title: 'Implement OAuth providers',
        description: 'Integrate Google and Apple Sign-In with proper error handling',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `task-${Date.now()}-4`,
        title: 'Add two-factor authentication',
        description: 'Support for TOTP apps and SMS verification',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    // Save initial tasks
    saveTasksToStorage()
  } else {
    tasks.value = storedTasks
  }
}

// Format status for display
const formatStatus = (status) => {
  const statusMap = {
    'planned': 'Planned',
    'in-progress': 'In Progress',
    'done': 'Done'
  }
  return statusMap[status] || status
}

// Update feature status
const updateStatus = (newStatus) => {
  feature.value.status = newStatus
  storage.saveFeature(projectId.value, feature.value)
  showStatusMenu.value = false
}

// Toggle task completion
const toggleTask = (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    task.completedAt = task.completed ? new Date().toISOString() : null
    saveTasksToStorage()
  }
}

// Update task
const updateTask = (updatedTask) => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
    saveTasksToStorage()
  }
}

// Add new task
const addTask = () => {
  if (!newTask.value.title) return
  
  const task = {
    id: `task-${Date.now()}`,
    title: newTask.value.title,
    description: newTask.value.description,
    priority: newTask.value.priority,
    completed: false,
    createdAt: new Date().toISOString()
  }
  
  tasks.value.push(task)
  saveTasksToStorage()
  
  // Reset form
  newTask.value = {
    title: '',
    description: '',
    priority: 'medium'
  }
  showAddTask.value = false
}

// Save tasks to storage
const saveTasksToStorage = () => {
  // Store tasks within the feature object
  feature.value.tasks = tasks.value
  storage.saveFeature(projectId.value, feature.value)
}

// Delete task
const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  saveTasksToStorage()
}

// Navigate to dependency
const navigateToDependency = (dependencyId) => {
  // In a real app, this would navigate to the dependency detail page
  console.log('Navigate to dependency:', dependencyId)
}

// Initialize
onMounted(() => {
  loadFeatureData()
})
</script>