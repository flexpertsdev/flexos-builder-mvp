<template>
  <div class="bg-bg-tertiary rounded-lg p-6 min-w-[200px]">
    <div class="flex flex-col items-center">
      <!-- Progress circle -->
      <div class="relative w-32 h-32 mb-4">
        <svg class="w-32 h-32 transform -rotate-90">
          <!-- Background circle -->
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            stroke-width="12"
            fill="none"
            class="text-bg-quaternary"
          />
          <!-- Progress circle -->
          <circle
            cx="64"
            cy="64"
            r="56"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-width="12"
            fill="none"
            class="text-primary transition-all duration-500 ease-out"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- Center content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold text-primary">{{ progress }}%</span>
          <span class="text-xs text-text-muted">Complete</span>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="bg-bg-quaternary rounded-lg p-3 text-center">
          <div class="text-xl font-semibold">{{ completedTasks }}</div>
          <div class="text-xs text-text-muted">Tasks Done</div>
        </div>
        <div class="bg-bg-quaternary rounded-lg p-3 text-center">
          <div class="text-xl font-semibold">{{ remainingTasks }}</div>
          <div class="text-xs text-text-muted">Remaining</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 0
  }
})

// Circle calculations
const radius = 56
const circumference = 2 * Math.PI * radius

const strokeDashoffset = computed(() => {
  const offset = circumference - (props.progress / 100) * circumference
  return offset
})

const remainingTasks = computed(() => {
  return props.totalTasks - props.completedTasks
})
</script>