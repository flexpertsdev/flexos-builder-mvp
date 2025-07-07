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
            <h1 class="text-2xl font-bold">{{ page?.name || 'Loading...' }}</h1>
            <span 
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-semibold',
                statusClasses[page?.status || 'design']
              ]"
            >
              {{ formatStatus(page?.status) }}
            </span>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit
          </button>
          <button 
            v-if="page?.status !== 'done'"
            @click="markReviewComplete"
            class="btn btn-primary"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" stroke-width="2" />
            </svg>
            Mark Review Complete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <!-- Left column - Design Preview -->
      <div class="space-y-6">
        <div class="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
          <!-- Design tabs -->
          <div class="flex bg-bg-tertiary border-b border-border-primary">
            <button
              v-for="tab in designTabs"
              :key="tab"
              @click="activeDesignTab = tab"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2',
                activeDesignTab === tab
                  ? 'text-primary bg-bg-secondary border-primary'
                  : 'text-text-tertiary hover:text-text-secondary border-transparent'
              ]"
            >
              {{ tab }}
            </button>
          </div>
          
          <!-- Design preview area -->
          <div class="p-8 min-h-[600px] flex items-center justify-center">
            <div class="w-full max-w-4xl">
              <!-- Mockup container -->
              <div class="bg-bg-tertiary border border-border-primary rounded-lg overflow-hidden shadow-lg">
                <div class="bg-bg-quaternary px-4 py-3 flex items-center gap-2 border-b border-border-primary">
                  <div class="w-3 h-3 rounded-full bg-border-secondary"></div>
                  <div class="w-3 h-3 rounded-full bg-border-secondary"></div>
                  <div class="w-3 h-3 rounded-full bg-border-secondary"></div>
                </div>
                
                <div class="p-8 text-center">
                  <!-- Dynamic mockup content based on active tab -->
                  <div v-if="activeDesignTab === 'Desktop'" class="space-y-6">
                    <div class="bg-bg-quaternary border-2 border-dashed border-border-secondary rounded-lg p-16">
                      <svg class="w-12 h-12 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="2"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 9 6 6M15 9l-6 6"/>
                      </svg>
                      <p class="text-text-tertiary">{{ getSectionName(0) }}</p>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4">
                      <div v-for="i in 3" :key="i" class="bg-bg-quaternary border border-border-primary rounded-md h-32"></div>
                    </div>
                  </div>
                  
                  <div v-else-if="activeDesignTab === 'Tablet'" class="space-y-6">
                    <div class="bg-bg-quaternary border-2 border-dashed border-border-secondary rounded-lg p-12">
                      <p class="text-text-tertiary">Tablet View</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div v-for="i in 2" :key="i" class="bg-bg-quaternary border border-border-primary rounded-md h-32"></div>
                    </div>
                  </div>
                  
                  <div v-else-if="activeDesignTab === 'Mobile'" class="max-w-sm mx-auto space-y-4">
                    <div class="bg-bg-quaternary border-2 border-dashed border-border-secondary rounded-lg p-8">
                      <p class="text-text-tertiary">Mobile View</p>
                    </div>
                    <div class="space-y-3">
                      <div v-for="i in 3" :key="i" class="bg-bg-quaternary border border-border-primary rounded-md h-24"></div>
                    </div>
                  </div>
                  
                  <div v-else class="space-y-4">
                    <p class="text-text-tertiary mb-6">Component Library</p>
                    <div class="grid grid-cols-2 gap-4">
                      <div v-for="i in 4" :key="i" class="bg-bg-quaternary border border-border-primary rounded-md h-24 p-4 flex items-center justify-center text-text-muted text-sm">
                        Component {{ i }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right column - Details -->
      <div class="space-y-6">
        <!-- Overview -->
        <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
          <h3 class="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">Overview</h3>
          <p class="text-text-secondary leading-relaxed mb-4">
            {{ page?.description || 'No description provided yet.' }}
          </p>
          
          <!-- Progress -->
          <div class="pt-4 border-t border-border-primary">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-text-secondary">Completion</span>
              <span class="text-sm font-semibold text-primary">{{ completionPercentage }}%</span>
            </div>
            <div class="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary transition-all duration-500"
                :style="{ width: completionPercentage + '%' }"
              ></div>
            </div>
          </div>
          
          <!-- Metadata -->
          <div class="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border-primary">
            <div>
              <div class="text-xs text-text-muted mb-1">Last Updated</div>
              <div class="text-sm text-text-secondary">{{ formatDate(page?.updatedAt) }}</div>
            </div>
            <div>
              <div class="text-xs text-text-muted mb-1">Updated By</div>
              <div class="text-sm text-text-secondary">{{ page?.updatedBy || 'AI Assistant' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Page Sections -->
        <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
          <h3 class="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">Page Sections</h3>
          <div class="space-y-3">
            <div 
              v-for="(section, index) in pageSections" 
              :key="section.id"
              class="flex items-start gap-3"
            >
              <svg class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" stroke-width="2" />
              </svg>
              <span class="text-sm text-text-secondary">{{ section.name }}</span>
            </div>
          </div>
          
          <button 
            @click="showAddSection = true"
            class="btn btn-secondary w-full mt-4 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
            </svg>
            Add Section
          </button>
        </div>
        
        <!-- Technical Details -->
        <div class="bg-bg-secondary border border-border-primary rounded-xl p-6">
          <h3 class="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">Technical Details</h3>
          
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tag in technicalTags" 
              :key="tag"
              class="px-3 py-1 bg-bg-tertiary border border-border-primary rounded-xl text-xs text-text-secondary"
            >
              {{ tag }}
            </span>
          </div>
          
          <!-- Action buttons -->
          <div class="space-y-3">
            <button class="btn-action">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              View Specifications
            </button>
            
            <button class="btn-action">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                <polyline points="8 6 2 12 8 18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              View Code
            </button>
            
            <button class="btn-action">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" stroke-width="2" />
              </svg>
              Preview Live
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Section Modal -->
    <div v-if="showAddSection" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-bg-secondary rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Add Page Section</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-text-secondary mb-2">Section Name</label>
            <input 
              v-model="newSection.name"
              type="text"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none"
              placeholder="e.g., Hero Banner, Product Grid..."
            />
          </div>
          
          <div>
            <label class="block text-sm text-text-secondary mb-2">Description</label>
            <textarea 
              v-model="newSection.description"
              rows="3"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md focus:border-primary focus:outline-none resize-none"
              placeholder="Describe this section's purpose and content..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="addSection"
            class="btn btn-primary flex-1"
          >
            Add Section
          </button>
          <button 
            @click="showAddSection = false"
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

const route = useRoute()
const router = useRouter()
const storage = useStorage()

// Page data
const projectId = computed(() => route.params.id)
const pageId = computed(() => route.params.pageId)
const page = ref(null)

// UI state
const activeDesignTab = ref('Desktop')
const designTabs = ['Desktop', 'Tablet', 'Mobile', 'Components']
const showAddSection = ref(false)
const newSection = ref({
  name: '',
  description: ''
})

// Page sections
const pageSections = ref([])

// Technical tags
const technicalTags = ref(['Vue.js', 'Responsive', 'SEO Optimized', 'Lazy Loading', 'A11y Compliant'])

// Status styling
const statusClasses = {
  'design': 'bg-info bg-opacity-20 text-info',
  'development': 'bg-warning bg-opacity-20 text-warning',
  'review': 'bg-warning bg-opacity-20 text-warning',
  'done': 'bg-success bg-opacity-20 text-success'
}

// Computed completion percentage
const completionPercentage = computed(() => {
  if (page.value?.status === 'done') return 100
  if (page.value?.status === 'review') return 90
  if (page.value?.status === 'development') return 60
  if (page.value?.status === 'design') return 30
  return 0
})

// Load page data
const loadPageData = () => {
  // Get page from storage
  const pages = storage.getPages(projectId.value)
  page.value = pages.find(p => p.id === pageId.value)
  
  if (!page.value) {
    // Navigate back if page not found
    router.back()
    return
  }
  
  // Initialize with example data if not already set
  if (!page.value.status) page.value.status = 'done'
  if (!page.value.updatedAt) page.value.updatedAt = new Date().toISOString()
  
  // Load sections from storage or initialize defaults
  const storedSections = page.value.sections || []
  
  if (storedSections.length === 0) {
    // Initialize with example sections based on page type
    if (page.value.name?.toLowerCase().includes('home')) {
      pageSections.value = [
        { id: `section-${Date.now()}-1`, name: 'Hero banner with CTA buttons' },
        { id: `section-${Date.now()}-2`, name: 'Featured products carousel' },
        { id: `section-${Date.now()}-3`, name: 'Category navigation grid' },
        { id: `section-${Date.now()}-4`, name: 'Customer testimonials' },
        { id: `section-${Date.now()}-5`, name: 'Newsletter signup form' }
      ]
    } else if (page.value.name?.toLowerCase().includes('product')) {
      pageSections.value = [
        { id: `section-${Date.now()}-1`, name: 'Product gallery with zoom' },
        { id: `section-${Date.now()}-2`, name: 'Product details and pricing' },
        { id: `section-${Date.now()}-3`, name: 'Add to cart options' },
        { id: `section-${Date.now()}-4`, name: 'Related products' },
        { id: `section-${Date.now()}-5`, name: 'Customer reviews' }
      ]
    } else {
      pageSections.value = [
        { id: `section-${Date.now()}-1`, name: 'Page header' },
        { id: `section-${Date.now()}-2`, name: 'Main content area' },
        { id: `section-${Date.now()}-3`, name: 'Sidebar or secondary content' }
      ]
    }
    saveSectionsToStorage()
  } else {
    pageSections.value = storedSections
  }
  
  // Set technical tags based on page
  if (page.value.technicalTags) {
    technicalTags.value = page.value.technicalTags
  }
}

// Format status for display
const formatStatus = (status) => {
  const statusMap = {
    'design': 'In Design',
    'development': 'In Development',
    'review': 'In Review',
    'done': 'Done'
  }
  return statusMap[status] || status
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Just now'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  
  return date.toLocaleDateString()
}

// Get section name for mockup
const getSectionName = (index) => {
  return pageSections.value[index]?.name || 'Section'
}

// Add new section
const addSection = () => {
  if (!newSection.value.name) return
  
  const section = {
    id: `section-${Date.now()}`,
    name: newSection.value.name,
    description: newSection.value.description
  }
  
  pageSections.value.push(section)
  saveSectionsToStorage()
  
  // Reset form
  newSection.value = {
    name: '',
    description: ''
  }
  showAddSection.value = false
}

// Save sections to storage
const saveSectionsToStorage = () => {
  page.value.sections = pageSections.value
  storage.savePage(projectId.value, page.value)
}

// Mark review as complete
const markReviewComplete = () => {
  page.value.status = 'done'
  page.value.updatedAt = new Date().toISOString()
  storage.savePage(projectId.value, page.value)
}

// Initialize
onMounted(() => {
  loadPageData()
})
</script>

<style scoped>
.btn-action {
  @apply w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-md
    text-text-secondary text-sm font-medium
    hover:bg-bg-quaternary hover:text-text-primary hover:-translate-y-0.5
    transition-all duration-200
    flex items-center justify-center gap-2;
}
</style>