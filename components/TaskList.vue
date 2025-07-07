<template>
  <div class="divide-y divide-border-primary">
    <div 
      v-for="task in sortedTasks" 
      :key="task.id"
      class="px-6 py-4 hover:bg-bg-tertiary transition-colors group"
    >
      <div class="flex items-start gap-3">
        <!-- Checkbox -->
        <div class="mt-0.5">
          <input 
            type="checkbox"
            :id="task.id"
            :checked="task.completed"
            @change="toggleTask(task.id)"
            class="w-4 h-4 rounded border-border-primary text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-bg-secondary cursor-pointer"
          />
        </div>
        
        <!-- Task content -->
        <div class="flex-1 min-w-0">
          <label 
            :for="task.id"
            class="cursor-pointer"
          >
            <h4 
              class="font-medium text-sm transition-all"
              :class="task.completed ? 'text-text-muted line-through' : 'text-text-primary'"
            >
              {{ task.title }}
            </h4>
          </label>
          
          <p 
            class="text-sm text-text-secondary mt-1"
            :class="task.completed ? 'line-through opacity-60' : ''"
          >
            {{ task.description }}
          </p>
          
          <div class="flex items-center gap-4 mt-2">
            <!-- Priority indicator -->
            <span 
              class="text-xs flex items-center gap-1"
              :class="priorityClasses[task.priority]"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              {{ formatPriority(task.priority) }} Priority
            </span>
            
            <!-- Due date or completion date -->
            <span v-if="task.dueDate && !task.completed" class="text-xs text-text-muted">
              Due {{ formatRelativeDate(task.dueDate) }}
            </span>
            <span v-else-if="task.completedAt" class="text-xs text-text-muted">
              Completed {{ formatRelativeDate(task.completedAt) }}
            </span>
            
            <!-- Assignee -->
            <span v-if="task.assignee" class="text-xs text-text-muted flex items-center gap-1">
              <div class="w-4 h-4 rounded-full bg-bg-quaternary flex items-center justify-center text-[10px]">
                {{ task.assignee.initials || task.assignee.name?.charAt(0) || '?' }}
              </div>
              {{ task.assignee.name }}
            </span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button 
            @click="editTask(task)"
            class="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-quaternary rounded transition-all"
            title="Edit task"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            @click="deleteTask(task.id)"
            class="p-1.5 text-text-muted hover:text-error hover:bg-bg-quaternary rounded transition-all"
            title="Delete task"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-if="tasks.length === 0" class="px-6 py-12 text-center">
      <svg class="w-12 h-12 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <p class="text-text-muted">No tasks yet. Add your first task to get started!</p>
    </div>
    
    <!-- Edit Task Modal -->
    <div v-if="editingTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-bg-secondary rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Edit Task</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-2">Task Title</label>
            <input 
              v-model="editForm.title"
              type="text"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
              placeholder="Enter task title..."
            />
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Description</label>
            <textarea 
              v-model="editForm.description"
              rows="3"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none resize-none"
              placeholder="Enter task description..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Priority</label>
            <select 
              v-model="editForm.priority"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Due Date</label>
            <input 
              v-model="editForm.dueDate"
              type="date"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="saveEdit"
            class="btn btn-primary flex-1"
          >
            Save Changes
          </button>
          <button 
            @click="cancelEdit"
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
import { ref, computed } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle', 'update', 'delete'])

// Editing state
const editingTask = ref(null)
const editForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

// Priority styling
const priorityClasses = {
  high: 'text-error',
  medium: 'text-warning',
  low: 'text-info'
}

// Sort tasks: incomplete first, then by priority
const sortedTasks = computed(() => {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  
  return [...props.tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    // Sort by priority
    const aPriority = priorityOrder[a.priority] ?? 1
    const bPriority = priorityOrder[b.priority] ?? 1
    return aPriority - bPriority
  })
})

// Toggle task completion
const toggleTask = (taskId) => {
  emit('toggle', taskId)
}

// Format priority display
const formatPriority = (priority) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

// Format relative date
const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInHours < 0) {
    // Future dates
    const futureDiffInHours = Math.abs(diffInHours)
    const futureDiffInDays = Math.floor(futureDiffInHours / 24)
    
    if (futureDiffInDays === 0) return 'today'
    if (futureDiffInDays === 1) return 'tomorrow'
    if (futureDiffInDays < 7) return `in ${futureDiffInDays} days`
    return date.toLocaleDateString()
  }
  
  // Past dates
  if (diffInHours < 1) return 'just now'
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

// Edit task
const editTask = (task) => {
  editingTask.value = task
  editForm.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  }
}

// Save edit
const saveEdit = () => {
  if (!editForm.value.title) return
  
  const updatedTask = {
    ...editingTask.value,
    title: editForm.value.title,
    description: editForm.value.description,
    priority: editForm.value.priority,
    dueDate: editForm.value.dueDate ? new Date(editForm.value.dueDate).toISOString() : null
  }
  
  emit('update', updatedTask)
  cancelEdit()
}

// Cancel edit
const cancelEdit = () => {
  editingTask.value = null
  editForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  }
}

// Delete task
const deleteTask = (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', taskId)
  }
}
</script>