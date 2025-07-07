<template>
  <div class="bg-bg-tertiary border border-border-primary rounded-lg p-4 mb-3">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <div :class="[
          'w-2 h-2 rounded-full',
          suggestion.type === 'feature' ? 'bg-success' :
          suggestion.type === 'page' ? 'bg-info' :
          suggestion.type === 'journey' ? 'bg-warning' :
          'bg-accent'
        ]"></div>
        <span class="text-sm font-medium text-text-secondary">
          {{ formatSuggestionType(suggestion.type) }} Suggestion
        </span>
      </div>
      <span class="text-xs text-text-muted">{{ formatTime(suggestion.timestamp) }}</span>
    </div>
    
    <!-- Content -->
    <div class="space-y-2 mb-4">
      <h4 class="font-semibold text-text-primary">{{ suggestion.title }}</h4>
      <p class="text-sm text-text-secondary">{{ suggestion.description }}</p>
      
      <!-- Preview of changes -->
      <div v-if="suggestion.preview" class="mt-3 p-3 bg-bg-quaternary rounded-md">
        <div class="text-xs text-text-muted mb-2">Preview:</div>
        <div class="text-sm text-text-secondary">
          <template v-if="suggestion.type === 'feature'">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">Priority:</span>
              <span :class="[
                'px-2 py-0.5 rounded text-xs',
                suggestion.preview.priority === 'high' ? 'bg-error bg-opacity-20 text-error' :
                suggestion.preview.priority === 'medium' ? 'bg-warning bg-opacity-20 text-warning' :
                'bg-success bg-opacity-20 text-success'
              ]">
                {{ suggestion.preview.priority }}
              </span>
            </div>
            <div v-if="suggestion.preview.category" class="flex items-center gap-2">
              <span class="font-medium">Category:</span>
              <span>{{ suggestion.preview.category }}</span>
            </div>
          </template>
          
          <template v-else-if="suggestion.type === 'page'">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">Type:</span>
              <span>{{ suggestion.preview.type || 'page' }}</span>
            </div>
            <div v-if="suggestion.preview.sections" class="flex items-center gap-2">
              <span class="font-medium">Sections:</span>
              <span>{{ suggestion.preview.sections.length }} sections</span>
            </div>
          </template>
          
          <template v-else-if="suggestion.type === 'journey'">
            <div class="flex items-center gap-2">
              <span class="font-medium">Steps:</span>
              <span>{{ suggestion.preview.steps?.length || 0 }} steps</span>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Edit mode -->
    <div v-if="isEditing" class="mb-4 space-y-3">
      <div>
        <label class="block text-xs text-text-muted mb-1">Title</label>
        <input 
          v-model="editedSuggestion.title"
          class="w-full px-3 py-2 bg-bg-quaternary border border-border-primary rounded-md text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs text-text-muted mb-1">Description</label>
        <textarea 
          v-model="editedSuggestion.description"
          rows="2"
          class="w-full px-3 py-2 bg-bg-quaternary border border-border-primary rounded-md text-sm focus:border-primary focus:outline-none resize-none"
        ></textarea>
      </div>
      
      <!-- Type-specific edits -->
      <div v-if="suggestion.type === 'feature'" class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-text-muted mb-1">Priority</label>
          <select 
            v-model="editedSuggestion.preview.priority"
            class="w-full px-3 py-2 bg-bg-quaternary border border-border-primary rounded-md text-sm focus:border-primary focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Category</label>
          <input 
            v-model="editedSuggestion.preview.category"
            class="w-full px-3 py-2 bg-bg-quaternary border border-border-primary rounded-md text-sm focus:border-primary focus:outline-none"
            placeholder="e.g., Core Features"
          />
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <template v-if="!isEditing">
        <button 
          @click="handleAccept"
          class="flex-1 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>
        <button 
          @click="startEdit"
          class="flex-1 px-3 py-1.5 bg-bg-quaternary text-text-secondary rounded-md text-sm font-medium hover:bg-bg-tertiary hover:text-text-primary transition-colors"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modify
        </button>
        <button 
          @click="handleReject"
          class="px-3 py-1.5 bg-bg-quaternary text-text-muted rounded-md text-sm font-medium hover:bg-error hover:bg-opacity-20 hover:text-error transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </template>
      
      <template v-else>
        <button 
          @click="saveEdit"
          class="flex-1 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Save Changes
        </button>
        <button 
          @click="cancelEdit"
          class="flex-1 px-3 py-1.5 bg-bg-quaternary text-text-secondary rounded-md text-sm font-medium hover:bg-bg-tertiary transition-colors"
        >
          Cancel
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['accept', 'modify', 'reject'])

// Edit state
const isEditing = ref(false)
const editedSuggestion = reactive({})

// Format suggestion type for display
const formatSuggestionType = (type) => {
  const types = {
    feature: 'Feature',
    page: 'Page',
    journey: 'User Journey',
    mockup: 'Mockup'
  }
  return types[type] || type
}

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = (now - date) / 1000 // seconds
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

// Start editing
const startEdit = () => {
  // Deep clone the suggestion for editing
  Object.assign(editedSuggestion, JSON.parse(JSON.stringify(props.suggestion)))
  isEditing.value = true
}

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false
  Object.keys(editedSuggestion).forEach(key => delete editedSuggestion[key])
}

// Save edited suggestion
const saveEdit = () => {
  emit('modify', { 
    originalId: props.suggestion.id,
    modified: { ...editedSuggestion }
  })
  isEditing.value = false
}

// Handle accept
const handleAccept = () => {
  emit('accept', props.suggestion)
}

// Handle reject
const handleReject = () => {
  emit('reject', props.suggestion.id)
}
</script>