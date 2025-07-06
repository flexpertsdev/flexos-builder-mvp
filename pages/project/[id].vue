<template>
  <div class="h-screen flex flex-col bg-bg-primary">
    <!-- Header -->
    <header class="bg-bg-secondary border-b border-border-primary flex-shrink-0 h-[60px]">
      <div class="px-6 h-full flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="showDashboard = true"
            class="text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2 rounded-md hover:bg-bg-tertiary"
            title="Switch projects (Cmd+K)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="bg-bg-tertiary px-4 py-2 rounded-md border border-border-primary">
            <h1 class="text-base font-medium">{{ project?.name || 'New Project' }}</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            @click="enterFocusMode"
            class="btn btn-focus"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Focus Mode
          </button>
          <button 
            @click="exportDocumentation"
            class="btn btn-primary"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export Docs
          </button>
        </div>
      </div>
    </header>
    
    <!-- Context Bars -->
    <div class="bg-bg-secondary border-b border-border-primary px-6 py-2 flex-shrink-0">
      <div class="flex items-center gap-2 text-sm">
        <span class="text-text-secondary">Context:</span>
        
        <!-- Feature Context Items -->
        <div v-for="item in contextItems.features" :key="item.id" class="context-item">
          <span class="text-success">●</span>
          <span>{{ item.name }}</span>
          <button @click="removeContext('feature', item.id)" class="ml-1">×</button>
        </div>
        
        <!-- Page Context Items -->
        <div v-for="item in contextItems.pages" :key="item.id" class="context-item">
          <span class="text-info">●</span>
          <span>{{ item.name }}</span>
          <button @click="removeContext('page', item.id)" class="ml-1">×</button>
        </div>
        
        <!-- File Context Items -->
        <div v-for="item in contextItems.files" :key="item.id" class="context-item">
          <span class="text-warning">●</span>
          <span>{{ item.name }}</span>
          <button @click="removeContext('file', item.id)" class="ml-1">×</button>
        </div>
        
        <!-- Add context button -->
        <button 
          @click="showAddContext = true"
          class="context-item hover:bg-bg-tertiary"
        >
          <span>+</span>
          <span>Add Context</span>
        </button>
      </div>
    </div>
    
    <!-- Two-panel layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Chat (40%) -->
      <div class="w-2/5 flex flex-col bg-bg-primary border-r border-border-primary">
        <!-- Progress indicator -->
        <div class="p-4 border-b border-border-primary">
          <ProgressIndicator
            :conversations="messages"
            :features="features"
            :pages="pages"
            :journeys="journeys"
            :mockups="mockups"
          />
        </div>
        
        <!-- Chat panel -->
        <div class="flex-1 flex flex-col">
          <ChatPanel 
            :messages="messages" 
            :context="contextItems"
            @send="handleSendMessage"
            @attach="handleAttachment"
          />
        </div>
      </div>
      
      <!-- Right Panel: Content (60%) -->
      <div class="w-3/5 flex flex-col bg-bg-secondary">
        <ContentPanel 
          :activeTab="activeTab"
          :project="project"
          :features="features"
          :pages="pages"
          :journeys="journeys"
          :mockups="mockups"
          @tab-change="activeTab = $event"
          @update-content="handleContentUpdate"
        />
      </div>
    </div>
    
    <!-- Focus Mode Overlay -->
    <FocusMode 
      v-if="showFocusMode"
      :messages="messages"
      :context="contextItems"
      @send="handleSendMessage"
      @close="showFocusMode = false"
    />
    
    <!-- Add Context Modal -->
    <div v-if="showAddContext" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Add Context</h3>
        
        <div class="space-y-4">
          <!-- Feature selector -->
          <div>
            <label class="block text-sm text-text-secondary mb-2">Features</label>
            <select 
              v-model="newContextFeature"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md"
            >
              <option value="">Select a feature...</option>
              <option 
                v-for="feature in availableFeatures" 
                :key="feature.id"
                :value="feature.id"
              >
                {{ feature.name }}
              </option>
            </select>
          </div>
          
          <!-- Page selector -->
          <div>
            <label class="block text-sm text-text-secondary mb-2">Pages</label>
            <select 
              v-model="newContextPage"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md"
            >
              <option value="">Select a page...</option>
              <option 
                v-for="page in availablePages" 
                :key="page.id"
                :value="page.id"
              >
                {{ page.name }}
              </option>
            </select>
          </div>
          
          <!-- File upload -->
          <div>
            <label class="block text-sm text-text-secondary mb-2">Upload File</label>
            <input 
              type="file"
              @change="handleFileUpload"
              class="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-md text-sm"
            />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            @click="addSelectedContext"
            class="btn btn-primary flex-1"
          >
            Add Context
          </button>
          <button 
            @click="showAddContext = false"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Dashboard Overlay -->
    <DashboardOverlay
      :isOpen="showDashboard"
      :currentProjectId="projectId"
      @close="showDashboard = false"
      @switch="handleProjectSwitch"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '~/composables/useStorage'
import ChatPanel from '~/components/ChatPanel.vue'
import ContentPanel from '~/components/ContentPanel.vue'
import FocusMode from '~/components/FocusMode.vue'
import ProgressIndicator from '~/components/ProgressIndicator.vue'
import DashboardOverlay from '~/components/DashboardOverlay.vue'

// Use auth middleware
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const storage = useStorage()

// Project data
const projectId = computed(() => route.params.id)
const project = ref(null)
const messages = ref([])
const features = ref([])
const pages = ref([])
const journeys = ref([])
const mockups = ref([])

// UI state
const activeTab = ref('vision')
const showFocusMode = ref(false)
const showAddContext = ref(false)
const showDashboard = ref(false)

// Context management
const contextItems = ref({
  features: [],
  pages: [],
  files: []
})

// Context modal state
const newContextFeature = ref('')
const newContextPage = ref('')

// Available items for context (not already in context)
const availableFeatures = computed(() => 
  features.value.filter(f => !contextItems.value.features.find(cf => cf.id === f.id))
)

const availablePages = computed(() => 
  pages.value.filter(p => !contextItems.value.pages.find(cp => cp.id === p.id))
)

// Load project data
const loadProjectData = () => {
  // Load project
  const projects = storage.getProjects()
  project.value = projects.find(p => p.id === projectId.value)
  
  if (!project.value) {
    // Create new project if not found
    project.value = {
      id: projectId.value,
      name: 'New Project',
      description: 'Click to start your discovery conversation'
    }
    storage.saveProject(project.value)
  }
  
  // Load all project data
  messages.value = storage.getConversations(projectId.value)
  features.value = storage.getFeatures(projectId.value)
  pages.value = storage.getPages(projectId.value)
  journeys.value = storage.getJourneys(projectId.value)
  mockups.value = storage.getMockups(projectId.value)
  
  // Add initial AI message if no messages
  if (messages.value.length === 0) {
    const welcomeMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Hi! I'm here to help you transform your idea into comprehensive documentation. What would you like to build?",
      timestamp: new Date().toISOString()
    }
    messages.value = [welcomeMessage]
    storage.saveConversation(projectId.value, welcomeMessage)
  }
}

// Mock AI responses for better interactivity
const aiResponses = {
  discovery: [
    "That sounds interesting! Can you tell me more about who your target users are? What kind of people would use this?",
    "I see. What specific problem are you trying to solve for them? What frustration or need does this address?",
    "Great! Now, let's think about the user journey. When someone first discovers your app, what would make them want to try it?",
    "Interesting approach! What would make your solution different from existing alternatives? What's your unique angle?",
    "Let's dive into the experience. Walk me through what happens after someone signs up - what's their first 'aha' moment?",
    "Good thinking! What features are absolutely essential for your first version? What can we launch without?",
    "That makes sense. How do you envision this growing over time? What would success look like in 6 months?",
    "Let's talk about the business side. How will users pay for this? One-time purchase, subscription, or something else?",
    "Perfect! Now, what could go wrong? What edge cases should we plan for? Think about things like lost internet, user mistakes, etc.",
    "Excellent! Based on everything we've discussed, I'll start creating some mockups to visualize these ideas. One moment..."
  ],
  features: [
    "Based on what you've told me, I think we need {feature}. This would help users {benefit}. Should we add this to our feature list?",
    "I'm thinking about edge cases for {feature}. What should happen if {scenario}? Should we handle it gracefully or show an error?",
    "For the {feature} you mentioned, I'm visualizing it as {description}. Does that match what you had in mind?",
    "Good point! Let me add {feature} to our feature list. This will be important for {reason}.",
    "Actually, thinking about {feature}, we might also need {related_feature} to make the experience complete. What do you think?"
  ],
  mockups: [
    "I've created a mockup for the {page} page. Take a look at the Mockups tab - does this capture what you were envisioning?",
    "Based on our discussion about {feature}, I've updated the mockup to include {change}. Check it out!",
    "Looking at the mockup, I'm wondering if we should {suggestion}. What's your preference?",
    "Great feedback! I'll adjust the mockup to {change}. This should make it more {benefit}.",
    "The mockup is coming together nicely! I think we're ready to document the technical requirements for this. Shall we?"
  ]
}

// Get contextual AI response
const getAIResponse = () => {
  const messageCount = messages.value.filter(m => m.role === 'user').length
  
  // Early discovery phase
  if (messageCount < 5) {
    return aiResponses.discovery[messageCount % aiResponses.discovery.length]
  }
  
  // Feature discussion phase
  if (activeTab.value === 'features' || messageCount < 10) {
    const response = aiResponses.features[Math.floor(Math.random() * aiResponses.features.length)]
    const feature = features.value[0]?.name || 'this feature'
    return response
      .replace('{feature}', feature)
      .replace('{benefit}', 'achieve their goals more easily')
      .replace('{scenario}', 'the user loses internet connection')
      .replace('{description}', 'a clean, intuitive interface')
      .replace('{reason}', 'providing a complete user experience')
      .replace('{related_feature}', 'user authentication')
  }
  
  // Mockup phase
  if (activeTab.value === 'mockups' || mockups.value.length > 0) {
    const response = aiResponses.mockups[Math.floor(Math.random() * aiResponses.mockups.length)]
    return response
      .replace('{page}', 'home')
      .replace('{feature}', 'user authentication')
      .replace('{change}', 'a prominent call-to-action button')
      .replace('{suggestion}', 'add a loading state')
      .replace('{benefit}', 'user-friendly')
  }
  
  // Default to discovery
  return aiResponses.discovery[Math.floor(Math.random() * aiResponses.discovery.length)]
}

// Handle sending messages
const handleSendMessage = async (content) => {
  // Add user message
  const userMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)
  storage.saveConversation(projectId.value, userMessage)
  
  // Show typing indicator
  const typingMessage = {
    id: 'typing',
    role: 'assistant',
    content: '',
    typing: true
  }
  messages.value.push(typingMessage)
  
  // Simulate AI thinking
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Remove typing indicator and add AI response
  messages.value = messages.value.filter(m => m.id !== 'typing')
  
  const aiMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: getAIResponse(),
    timestamp: new Date().toISOString()
  }
  messages.value.push(aiMessage)
  storage.saveConversation(projectId.value, aiMessage)
  
  // Sometimes create features or pages based on conversation
  if (Math.random() > 0.7 && features.value.length < 5) {
    const featureNames = [
      'User Authentication',
      'Product Catalog',
      'Shopping Cart',
      'Payment Processing',
      'Order Management',
      'Customer Support',
      'Analytics Dashboard',
      'Email Notifications'
    ]
    
    const newFeature = {
      id: `feat-${Date.now()}`,
      name: featureNames[features.value.length % featureNames.length],
      description: 'Auto-discovered from our conversation',
      priority: 'high',
      status: 'discovered'
    }
    
    features.value.push(newFeature)
    storage.saveFeature(projectId.value, newFeature)
  }
}

// Handle file attachments
const handleAttachment = (file) => {
  console.log('File attached:', file)
  // In a real app, this would process the file
}

// Add context
const addContext = (type, item) => {
  if (!contextItems.value[type + 's']) {
    contextItems.value[type + 's'] = []
  }
  
  const exists = contextItems.value[type + 's'].find(c => c.id === item.id)
  if (!exists) {
    contextItems.value[type + 's'].push(item)
  }
}

// Remove context
const removeContext = (type, itemId) => {
  const key = type + 's'
  if (contextItems.value[key]) {
    contextItems.value[key] = contextItems.value[key].filter(item => item.id !== itemId)
  }
}

// Add selected context from modal
const addSelectedContext = () => {
  if (newContextFeature.value) {
    const feature = features.value.find(f => f.id === newContextFeature.value)
    if (feature) addContext('feature', feature)
  }
  
  if (newContextPage.value) {
    const page = pages.value.find(p => p.id === newContextPage.value)
    if (page) addContext('page', page)
  }
  
  // Reset and close
  newContextFeature.value = ''
  newContextPage.value = ''
  showAddContext.value = false
}

// Handle file upload for context
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const fileContext = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: 'file',
      size: file.size,
      content: 'File content would be processed here'
    }
    addContext('file', fileContext)
    showAddContext.value = false
  }
}

// Handle content updates from ContentPanel
const handleContentUpdate = ({ type, data }) => {
  switch (type) {
    case 'feature':
      storage.saveFeature(projectId.value, data)
      features.value = storage.getFeatures(projectId.value)
      break
    case 'page':
      storage.savePage(projectId.value, data)
      pages.value = storage.getPages(projectId.value)
      break
    case 'journey':
      storage.saveJourney(projectId.value, data)
      journeys.value = storage.getJourneys(projectId.value)
      break
    case 'mockup':
      storage.saveMockup(projectId.value, data)
      mockups.value = storage.getMockups(projectId.value)
      break
  }
}

// Export documentation
const exportDocumentation = () => {
  // In a real app, this would generate and download documentation
  console.log('Exporting documentation...')
  alert('Documentation export coming soon!')
}

// Enter focus mode
const enterFocusMode = () => {
  showFocusMode.value = true
}

// Handle project switch from dashboard overlay
const handleProjectSwitch = (projectId) => {
  // Dashboard overlay handles the navigation
}

// Initialize
onMounted(() => {
  loadProjectData()
})

// Update project name
watch(() => project.value?.name, (newName) => {
  if (newName && project.value) {
    storage.saveProject(project.value)
  }
})
</script>

<style scoped>
/* Using the global context-item styles from main.css */
</style>