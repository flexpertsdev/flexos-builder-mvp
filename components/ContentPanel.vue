<template>
  <div class="flex flex-col h-full">
    <!-- Tabs -->
    <div class="flex border-b border-border-primary flex-shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-change', tab.id)"
        :class="['tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="ml-2 text-xs bg-bg-tertiary px-2 py-0.5 rounded-full">
          {{ tab.count }}
        </span>
      </button>
    </div>
    
    <!-- Tab content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Vision Tab -->
      <div v-if="activeTab === 'vision'" class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold mb-4">Project Vision</h2>
        
        <div class="bg-bg-tertiary rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-2">What You're Building</h3>
          <p class="text-text-secondary">
            {{ project?.description || 'Start a conversation to define your project vision.' }}
          </p>
        </div>
        
        <div class="bg-bg-tertiary rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-2">Target Audience</h3>
          <p class="text-text-secondary">
            {{ project?.targetAudience || 'We\'ll discover your target audience through our conversation.' }}
          </p>
        </div>
        
        <div class="bg-bg-tertiary rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Key Differentiators</h3>
          <div v-if="project?.differentiators?.length" class="space-y-2">
            <p v-for="(item, index) in project.differentiators" :key="index" class="text-text-secondary">
              • {{ item }}
            </p>
          </div>
          <p v-else class="text-text-secondary">
            Your unique value propositions will emerge as we explore your idea.
          </p>
        </div>
      </div>
      
      <!-- Mockups Tab -->
      <div v-if="activeTab === 'mockups'" class="space-y-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Visual Mockups</h2>
          <button 
            @click="createMockup"
            class="btn btn-secondary text-sm"
          >
            + Create Mockup
          </button>
        </div>
        
        <div v-if="mockups.length > 0" class="grid grid-cols-2 gap-6">
          <div 
            v-for="mockup in mockups" 
            :key="mockup.id"
            class="bg-bg-tertiary rounded-lg p-4 cursor-pointer hover:bg-bg-quaternary transition-colors"
            @click="openMockup(mockup)"
          >
            <h3 class="text-lg font-semibold mb-3">{{ mockup.name }}</h3>
            <div class="bg-white rounded h-64 flex items-center justify-center text-gray-400">
              <span>{{ mockup.type }} Mockup</span>
            </div>
            <p class="text-sm text-text-secondary mt-3">
              Last updated: {{ formatDate(mockup.updatedAt) }}
            </p>
          </div>
        </div>
        
        <div v-else class="text-center py-12 text-text-secondary">
          <p class="mb-4">No mockups yet. Start creating visual representations of your ideas!</p>
          <button 
            @click="createMockup"
            class="btn btn-primary"
          >
            Create Your First Mockup
          </button>
        </div>
      </div>
      
      <!-- Features Tab -->
      <div v-if="activeTab === 'features'" class="space-y-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Features & Requirements</h2>
          
          <!-- Filter buttons -->
          <div class="flex gap-2">
            <button 
              v-for="filter in featureFilters"
              :key="filter"
              @click="activeFeatureFilter = filter"
              :class="[
                'px-3 py-1 rounded-full text-sm transition-colors',
                activeFeatureFilter === filter 
                  ? 'bg-primary text-white' 
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>
        
        <div v-if="filteredFeatures.length > 0" class="space-y-4">
          <div 
            v-for="feature in filteredFeatures" 
            :key="feature.id"
            class="bg-bg-tertiary rounded-lg p-4 hover:bg-bg-quaternary transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">{{ feature.name }}</h3>
              <span :class="[
                'text-sm px-2 py-1 rounded',
                feature.priority === 'high' ? 'text-error bg-error bg-opacity-20' : 
                feature.priority === 'medium' ? 'text-warning bg-warning bg-opacity-20' : 
                'text-success bg-success bg-opacity-20'
              ]">
                {{ feature.priority }}
              </span>
            </div>
            <p class="text-text-secondary text-sm">
              {{ feature.description }}
            </p>
            <div class="mt-3 flex gap-2">
              <span class="text-xs bg-bg-quaternary px-2 py-1 rounded">
                {{ feature.status || 'discovered' }}
              </span>
              <span v-if="feature.category" class="text-xs bg-bg-quaternary px-2 py-1 rounded">
                {{ feature.category }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12 text-text-secondary">
          <p>No features discovered yet. Keep chatting to uncover what your app needs!</p>
        </div>
      </div>
      
      <!-- Pages Tab -->
      <div v-if="activeTab === 'pages'" class="space-y-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Pages & Screens</h2>
          
          <!-- Filter buttons -->
          <div class="flex gap-2">
            <button 
              v-for="filter in pageFilters"
              :key="filter"
              @click="activePageFilter = filter"
              :class="[
                'px-3 py-1 rounded-full text-sm transition-colors',
                activePageFilter === filter 
                  ? 'bg-primary text-white' 
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>
        
        <div v-if="filteredPages.length > 0" class="grid grid-cols-2 gap-4">
          <div 
            v-for="page in filteredPages" 
            :key="page.id"
            class="bg-bg-tertiary rounded-lg p-4 hover:bg-bg-quaternary transition-colors cursor-pointer"
          >
            <h3 class="font-semibold mb-2">{{ page.name }}</h3>
            <p class="text-text-secondary text-sm mb-3">
              {{ page.description }}
            </p>
            <div class="flex gap-2">
              <span class="text-xs bg-bg-quaternary px-2 py-1 rounded">
                {{ page.type || 'page' }}
              </span>
              <span v-if="page.status" class="text-xs bg-bg-quaternary px-2 py-1 rounded">
                {{ page.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12 text-text-secondary">
          <p>No pages defined yet. We'll discover them as we explore your app structure!</p>
        </div>
      </div>
      
      <!-- Journeys Tab -->
      <div v-if="activeTab === 'journeys'" class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">User Journeys</h2>
        
        <div v-if="journeys.length > 0" class="space-y-6">
          <div 
            v-for="journey in journeys" 
            :key="journey.id"
            class="bg-bg-tertiary rounded-lg p-6"
          >
            <h3 class="text-lg font-semibold mb-3">{{ journey.name }}</h3>
            <p class="text-text-secondary mb-4">{{ journey.description }}</p>
            
            <div v-if="journey.steps?.length" class="space-y-3">
              <div 
                v-for="(step, index) in journey.steps" 
                :key="index"
                class="flex items-start gap-3"
              >
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ step.title }}</p>
                  <p class="text-sm text-text-secondary">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12 text-text-secondary">
          <p>User journeys will be mapped as we understand how people will use your app.</p>
        </div>
      </div>
      
      <!-- Documentation Tab -->
      <div v-if="activeTab === 'docs'" class="prose prose-invert max-w-none">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Project Documentation</h2>
          <button 
            @click="$emit('export-docs')"
            class="btn btn-primary text-sm"
          >
            Export All
          </button>
        </div>
        
        <div class="bg-bg-tertiary rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Executive Summary</h3>
          <p class="text-text-secondary mb-4">
            {{ generateExecutiveSummary() }}
          </p>
          
          <h3 class="text-lg font-semibold mb-4">Features Overview</h3>
          <div class="space-y-2 mb-4">
            <p v-for="feature in features.slice(0, 5)" :key="feature.id" class="text-text-secondary">
              • <strong>{{ feature.name }}</strong>: {{ feature.description }}
            </p>
            <p v-if="features.length > 5" class="text-text-secondary italic">
              ...and {{ features.length - 5 }} more features
            </p>
          </div>
          
          <h3 class="text-lg font-semibold mb-4">Technical Requirements</h3>
          <p class="text-text-secondary">
            Based on our conversation, your app will need:
          </p>
          <ul class="list-disc list-inside text-text-secondary space-y-1 mt-2">
            <li>User authentication and authorization</li>
            <li>Data persistence and real-time updates</li>
            <li>Responsive design for mobile and desktop</li>
            <li>Secure payment processing (if applicable)</li>
            <li>Analytics and monitoring</li>
          </ul>
          
          <div class="mt-6 p-4 bg-bg-quaternary rounded-lg">
            <p class="text-sm text-text-secondary">
              This documentation is automatically generated from our conversation. 
              Export it to get a complete blueprint for building your app.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'vision'
  },
  project: {
    type: Object,
    default: () => ({})
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

const emit = defineEmits(['tab-change', 'update-content', 'export-docs'])

// Tab configuration with counts
const tabs = computed(() => [
  { id: 'vision', label: 'Vision' },
  { id: 'mockups', label: 'Mockups', count: props.mockups.length || null },
  { id: 'features', label: 'Features', count: props.features.length || null },
  { id: 'pages', label: 'Pages', count: props.pages.length || null },
  { id: 'journeys', label: 'Journeys', count: props.journeys.length || null },
  { id: 'docs', label: 'Documentation' }
])

// Filters
const featureFilters = ['All', 'Essential', 'Nice to Have', 'Future']
const activeFeatureFilter = ref('All')

const pageFilters = ['All', 'Public', 'Auth', 'Admin']
const activePageFilter = ref('All')

// Filtered data
const filteredFeatures = computed(() => {
  if (activeFeatureFilter.value === 'All') return props.features
  
  const filterMap = {
    'Essential': 'high',
    'Nice to Have': 'medium',
    'Future': 'low'
  }
  
  const priority = filterMap[activeFeatureFilter.value]
  return props.features.filter(f => f.priority === priority)
})

const filteredPages = computed(() => {
  if (activePageFilter.value === 'All') return props.pages
  return props.pages.filter(p => p.type === activePageFilter.value.toLowerCase())
})

// Actions
const createMockup = () => {
  const mockup = {
    id: `mockup-${Date.now()}`,
    name: 'New Mockup',
    type: 'Page',
    content: '<h1>New Mockup</h1>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  emit('update-content', { type: 'mockup', data: mockup })
}

const openMockup = (mockup) => {
  // In a real app, this would open a mockup editor
  console.log('Opening mockup:', mockup)
}

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const generateExecutiveSummary = () => {
  if (!props.project?.description) {
    return 'This document will contain the complete specifications for your project once we\'ve explored your idea together.'
  }
  
  return `This document outlines the complete specifications for ${props.project.name}. ${props.project.description} 
    Through our conversation, we've identified ${props.features.length} key features, ${props.pages.length} pages, 
    and ${props.journeys.length} user journeys that will make your vision a reality.`
}
</script>