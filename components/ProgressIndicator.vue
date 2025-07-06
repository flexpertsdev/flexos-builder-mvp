<template>
  <div class="bg-bg-secondary rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Discovery Progress</h3>
      <span class="text-sm text-primary font-medium">{{ progress }}%</span>
    </div>
    
    <!-- Progress bar -->
    <div class="progress-bar mb-4">
      <div 
        class="progress-fill"
        :style="`width: ${progress}%`"
      ></div>
    </div>
    
    <!-- Progress items -->
    <div class="space-y-2">
      <div 
        v-for="item in progressItems" 
        :key="item.id"
        class="flex items-center gap-3 text-sm"
      >
        <div :class="[
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
          item.completed ? 'bg-success' : 'bg-bg-tertiary'
        ]">
          <svg v-if="item.completed" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <span :class="[
          'flex-1',
          item.completed ? 'text-text-primary' : 'text-text-secondary'
        ]">
          {{ item.label }}
        </span>
        
        <span v-if="item.count > 0" class="text-xs text-text-muted">
          {{ item.count }}
        </span>
      </div>
    </div>
    
    <!-- Insights -->
    <div v-if="nextSteps.length > 0" class="mt-4 pt-4 border-t border-border-primary">
      <p class="text-sm text-text-secondary mb-2">Suggested next steps:</p>
      <ul class="space-y-1">
        <li v-for="step in nextSteps" :key="step" class="text-sm text-text-muted flex items-start gap-2">
          <span class="text-primary">→</span>
          <span>{{ step }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  features: {
    type: Array,
    default: () => []
  },
  pages: {
    type: Array,
    default: () => []
  },
  journeys: {
    type: Array,
    default: () => []
  },
  mockups: {
    type: Array,
    default: () => []
  }
})

// Calculate progress items
const progressItems = computed(() => [
  {
    id: 'conversation',
    label: 'Started discovery conversation',
    completed: props.conversations.length > 2,
    count: 0
  },
  {
    id: 'vision',
    label: 'Defined project vision',
    completed: props.conversations.length > 5,
    count: 0
  },
  {
    id: 'features',
    label: 'Discovered key features',
    completed: props.features.length > 0,
    count: props.features.length
  },
  {
    id: 'pages',
    label: 'Mapped out pages',
    completed: props.pages.length > 0,
    count: props.pages.length
  },
  {
    id: 'journeys',
    label: 'Created user journeys',
    completed: props.journeys.length > 0,
    count: props.journeys.length
  },
  {
    id: 'mockups',
    label: 'Built visual mockups',
    completed: props.mockups.length > 0,
    count: props.mockups.length
  },
  {
    id: 'documentation',
    label: 'Documentation ready',
    completed: props.features.length >= 5 && props.pages.length >= 3,
    count: 0
  }
])

// Calculate overall progress
const progress = computed(() => {
  const completed = progressItems.value.filter(item => item.completed).length
  return Math.round((completed / progressItems.value.length) * 100)
})

// Suggest next steps based on current progress
const nextSteps = computed(() => {
  const steps = []
  
  if (props.conversations.length < 3) {
    steps.push('Continue the conversation to explore your idea')
  } else if (props.features.length === 0) {
    steps.push('Discuss the features your users need')
  } else if (props.pages.length === 0) {
    steps.push('Talk about the different pages in your app')
  } else if (props.journeys.length === 0) {
    steps.push('Describe how users will navigate your app')
  } else if (props.mockups.length === 0) {
    steps.push('Create mockups to visualize your ideas')
  } else if (props.features.length < 5) {
    steps.push('Explore more features to complete your vision')
  } else {
    steps.push('Review and export your documentation')
  }
  
  return steps.slice(0, 2) // Show max 2 suggestions
})
</script>