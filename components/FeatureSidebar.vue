<template>
  <aside class="space-y-6">
    <!-- Dependencies -->
    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Dependencies
      </h3>
      
      <div v-if="dependencies.length > 0" class="space-y-3">
        <div 
          v-for="dep in dependencies" 
          :key="dep.id"
          class="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg hover:bg-bg-quaternary transition-colors cursor-pointer"
          @click="$emit('navigate-dependency', dep.id)"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="dep.completed ? 'bg-success bg-opacity-20' : 'bg-bg-quaternary'"
            >
              <svg 
                v-if="dep.completed" 
                class="w-4 h-4 text-success" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg 
                v-else 
                class="w-4 h-4 text-text-muted" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm" :class="dep.completed ? 'text-text-secondary' : 'text-text-primary'">
              {{ dep.name }}
            </span>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div v-else class="text-sm text-text-muted text-center py-4">
        No dependencies
      </div>
    </div>
    
    <!-- Team Members -->
    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Team Members
      </h3>
      
      <div v-if="team.length > 0" class="space-y-3">
        <div 
          v-for="member in team" 
          :key="member.id"
          class="flex items-center gap-3"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            :class="member.color || 'bg-bg-quaternary'"
          >
            {{ member.initials || member.name?.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium">{{ member.name }}</div>
            <div class="text-xs text-text-muted">{{ member.role }}</div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-text-muted text-center py-4">
        No team members assigned
      </div>
      
      <button class="btn btn-secondary w-full mt-4 text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
        </svg>
        Add Team Member
      </button>
    </div>
    
    <!-- Timeline -->
    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Timeline
      </h3>
      
      <div v-if="timeline.length > 0" class="relative">
        <!-- Timeline line -->
        <div class="absolute left-4 top-8 bottom-0 w-px bg-border-primary"></div>
        
        <!-- Timeline items -->
        <div class="space-y-4">
          <div 
            v-for="(milestone, index) in timeline" 
            :key="milestone.id"
            class="relative flex gap-4"
          >
            <!-- Dot -->
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
              :class="getTimelineStatusClass(milestone.status)"
            >
              <div 
                class="w-3 h-3 rounded-full"
                :class="getTimelineDotClass(milestone.status)"
              ></div>
            </div>
            
            <!-- Content -->
            <div class="flex-1 pb-4">
              <h4 
                class="text-sm font-medium"
                :class="milestone.status === 'completed' ? 'text-text-secondary' : 'text-text-primary'"
              >
                {{ milestone.title }}
              </h4>
              <p class="text-xs text-text-muted mt-1">{{ milestone.date }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-text-muted text-center py-4">
        No timeline defined
      </div>
    </div>
    
    <!-- Feature Metadata -->
    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
      <h3 class="font-semibold mb-4">Metadata</h3>
      
      <dl class="space-y-3">
        <div>
          <dt class="text-xs text-text-muted uppercase tracking-wider mb-1">Created</dt>
          <dd class="text-sm">{{ formatDate(createdAt) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-text-muted uppercase tracking-wider mb-1">Last Updated</dt>
          <dd class="text-sm">{{ formatDate(updatedAt) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-text-muted uppercase tracking-wider mb-1">Estimated Effort</dt>
          <dd class="text-sm">{{ estimatedEffort || 'Not estimated' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-text-muted uppercase tracking-wider mb-1">Feature ID</dt>
          <dd class="text-xs font-mono text-text-muted">{{ featureId }}</dd>
        </div>
      </dl>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  dependencies: {
    type: Array,
    default: () => []
  },
  team: {
    type: Array,
    default: () => []
  },
  timeline: {
    type: Array,
    default: () => []
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  estimatedEffort: {
    type: String,
    default: ''
  }
})

defineEmits(['navigate-dependency'])

const route = useRoute()
const featureId = computed(() => route.params.featureId)

// Timeline status styling
const getTimelineStatusClass = (status) => {
  const statusClasses = {
    completed: 'bg-success bg-opacity-20',
    current: 'bg-primary bg-opacity-20',
    pending: 'bg-bg-tertiary'
  }
  return statusClasses[status] || 'bg-bg-tertiary'
}

const getTimelineDotClass = (status) => {
  const dotClasses = {
    completed: 'bg-success',
    current: 'bg-primary',
    pending: 'bg-text-muted'
  }
  return dotClasses[status] || 'bg-text-muted'
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    if (diffInHours < 1) return 'Just now'
    return `${Math.floor(diffInHours)} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} days ago`
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  })
}
</script>