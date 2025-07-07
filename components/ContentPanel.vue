<template>
  <div class="flex flex-col h-full">
    <!-- Show detail views when active -->
    <FeatureDetailView
      v-if="activeDetailType === 'feature' && activeDetailId"
      :project-id="projectId"
      :feature-id="activeDetailId"
      @back="clearDetail"
      @update-context="handleDetailContext"
    />
    
    <PageDetailView
      v-else-if="activeDetailType === 'page' && activeDetailId"
      :project-id="projectId"
      :page-id="activeDetailId"
      @back="clearDetail"
      @update-context="handleDetailContext"
    />
    
    <!-- Regular content when no detail view is active -->
    <template v-else>
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
          <!-- Suggestion badge -->
          <span 
            v-if="tab.suggestionCount > 0" 
            class="ml-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full animate-pulse"
          >
            {{ tab.suggestionCount }}
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
            <div class="bg-white rounded h-64 overflow-hidden">
              <iframe 
                v-if="mockup.html || mockup.content"
                :srcdoc="mockup.html || mockup.content"
                class="w-full h-full border-0"
                sandbox="allow-scripts"
              ></iframe>
              <div v-else class="h-full flex items-center justify-center text-gray-400">
                <span>{{ mockup.type }} Mockup</span>
              </div>
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
        
        <!-- Feature Suggestions -->
        <div v-if="featureSuggestions.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-text-secondary">AI Suggestions</h3>
            <button 
              @click="$emit('clear-feature-suggestions')"
              class="text-xs text-text-muted hover:text-text-primary"
            >
              Clear all
            </button>
          </div>
          <div class="space-y-2">
            <SuggestionCard
              v-for="suggestion in featureSuggestions"
              :key="suggestion.id"
              :suggestion="suggestion"
              @accept="$emit('accept-suggestion', suggestion)"
              @modify="$emit('modify-suggestion', $event)"
              @reject="$emit('reject-suggestion', suggestion.id)"
            />
          </div>
        </div>
        
        <div v-if="filteredFeatures.length > 0" class="space-y-4">
          <div 
            v-for="feature in filteredFeatures" 
            :key="feature.id"
            @click="navigateToFeature(feature.id)"
            class="bg-bg-tertiary rounded-lg p-4 hover:bg-bg-quaternary transition-colors cursor-pointer"
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
        
        <!-- Page Suggestions -->
        <div v-if="pageSuggestions.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-text-secondary">AI Suggestions</h3>
            <button 
              @click="$emit('clear-page-suggestions')"
              class="text-xs text-text-muted hover:text-text-primary"
            >
              Clear all
            </button>
          </div>
          <div class="space-y-2">
            <SuggestionCard
              v-for="suggestion in pageSuggestions"
              :key="suggestion.id"
              :suggestion="suggestion"
              @accept="$emit('accept-suggestion', suggestion)"
              @modify="$emit('modify-suggestion', $event)"
              @reject="$emit('reject-suggestion', suggestion.id)"
            />
          </div>
        </div>
        
        <div v-if="filteredPages.length > 0" class="grid grid-cols-2 gap-4">
          <div 
            v-for="page in filteredPages" 
            :key="page.id"
            @click="navigateToPage(page.id)"
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
        
        <!-- Journey Suggestions -->
        <div v-if="journeySuggestions.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-text-secondary">AI Suggestions</h3>
            <button 
              @click="$emit('clear-journey-suggestions')"
              class="text-xs text-text-muted hover:text-text-primary"
            >
              Clear all
            </button>
          </div>
          <div class="space-y-2">
            <SuggestionCard
              v-for="suggestion in journeySuggestions"
              :key="suggestion.id"
              :suggestion="suggestion"
              @accept="$emit('accept-suggestion', suggestion)"
              @modify="$emit('modify-suggestion', $event)"
              @reject="$emit('reject-suggestion', suggestion.id)"
            />
          </div>
        </div>
        
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
    </template>
    
    <!-- Mockup Viewer Modal -->
    <Teleport to="body">
      <div 
        v-if="showMockupViewer && selectedMockup"
        class="fixed inset-0 z-50 bg-black bg-opacity-50"
        @click.self="showMockupViewer = false"
      >
        <div class="absolute inset-4 bg-bg-primary rounded-lg shadow-2xl overflow-hidden">
          <MockupViewer
            :mockup="selectedMockup"
            @close="showMockupViewer = false"
            @edit="handleEditMockup"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FeatureDetailView from '~/components/FeatureDetailView.vue'
import PageDetailView from '~/components/PageDetailView.vue'
import SuggestionCard from '~/components/SuggestionCard.vue'
import MockupViewer from '~/components/MockupViewer.vue'

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
  },
  pendingSuggestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'tab-change', 
  'update-content', 
  'export-docs', 
  'update-context',
  'accept-suggestion',
  'modify-suggestion',
  'reject-suggestion',
  'clear-feature-suggestions',
  'clear-page-suggestions',
  'clear-journey-suggestions'
])

const router = useRouter()
const route = useRoute()

// Project ID from route
const projectId = computed(() => route.params.id)

// Detail view state
const activeDetailType = ref(null) // 'feature' | 'page' | null
const activeDetailId = ref(null)

// Mockup viewer state
const showMockupViewer = ref(false)
const selectedMockup = ref(null)

// Filter suggestions by type
const featureSuggestions = computed(() => 
  props.pendingSuggestions.filter(s => s.type === 'feature' && s.status === 'pending')
)

const pageSuggestions = computed(() => 
  props.pendingSuggestions.filter(s => s.type === 'page' && s.status === 'pending')
)

const journeySuggestions = computed(() => 
  props.pendingSuggestions.filter(s => s.type === 'journey' && s.status === 'pending')
)

const mockupSuggestions = computed(() => 
  props.pendingSuggestions.filter(s => s.type === 'mockup' && s.status === 'pending')
)

// Tab configuration with counts and suggestion counts
const tabs = computed(() => [
  { 
    id: 'vision', 
    label: 'Vision',
    suggestionCount: 0 // Vision doesn't have direct suggestions
  },
  { 
    id: 'mockups', 
    label: 'Mockups', 
    count: props.mockups.length || null,
    suggestionCount: mockupSuggestions.value.length
  },
  { 
    id: 'features', 
    label: 'Features', 
    count: props.features.length || null,
    suggestionCount: featureSuggestions.value.length
  },
  { 
    id: 'pages', 
    label: 'Pages', 
    count: props.pages.length || null,
    suggestionCount: pageSuggestions.value.length
  },
  { 
    id: 'journeys', 
    label: 'Journeys', 
    count: props.journeys.length || null,
    suggestionCount: journeySuggestions.value.length
  },
  { 
    id: 'docs', 
    label: 'Documentation',
    suggestionCount: 0 // Docs doesn't have direct suggestions
  }
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
  selectedMockup.value = mockup
  showMockupViewer.value = true
}

// Navigate to feature detail view
const navigateToFeature = (featureId) => {
  activeDetailType.value = 'feature'
  activeDetailId.value = featureId
}

// Navigate to page detail view
const navigateToPage = (pageId) => {
  activeDetailType.value = 'page'
  activeDetailId.value = pageId
}

// Clear detail view and go back to list
const clearDetail = () => {
  activeDetailType.value = null
  activeDetailId.value = null
}

// Handle context update from detail views
const handleDetailContext = (context) => {
  emit('update-context', context)
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

// Handle edit mockup
const handleEditMockup = (mockup) => {
  showMockupViewer.value = false
  // In a real app, this would open the mockup editor
  console.log('Edit mockup:', mockup)
}
</script>