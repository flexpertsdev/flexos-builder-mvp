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
          <!-- Demo/Live Mode Toggle -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary rounded-md border border-border-primary">
            <button
              @click="toggleAIMode"
              class="flex items-center gap-2 text-sm"
              :class="isDemo ? 'text-warning' : 'text-success'"
            >
              <div class="w-2 h-2 rounded-full" :class="isDemo ? 'bg-warning' : 'bg-success'"></div>
              {{ isDemo ? 'Demo Mode' : 'Live Mode' }}
            </button>
          </div>
          
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
      <div class="w-2/5 flex flex-col bg-bg-primary border-r border-border-primary overflow-hidden">
        <!-- Progress indicator with conditional border -->
        <div class="flex-shrink-0">
          <div class="p-4 border-b border-border-primary">
            <ProgressIndicator
              :conversations="messages"
              :features="features"
              :pages="pages"
              :journeys="journeys"
              :mockups="mockups"
            />
          </div>
        </div>
        
        <!-- Chat panel -->
        <div class="flex-1 overflow-hidden">
          <ChatPanel 
            :messages="messages" 
            :context="contextItems"
            :features="features"
            :pages="pages"
            :journeys="journeys"
            @send="handleSendMessage"
            @attach="handleAttachment"
            @update-context="handleContextUpdate"
            @accept-suggestion="handleAcceptSuggestion"
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
          :pendingSuggestions="pendingSuggestions"
          @tab-change="activeTab = $event"
          @update-content="handleContentUpdate"
          @update-context="updateChatContext"
          @accept-suggestion="handleAcceptSuggestion"
          @modify-suggestion="handleModifySuggestion"
          @reject-suggestion="handleRejectSuggestion"
          @clear-feature-suggestions="clearSuggestionsByType('feature')"
          @clear-page-suggestions="clearSuggestionsByType('page')"
          @clear-journey-suggestions="clearSuggestionsByType('journey')"
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
import { useDatabase } from '~/composables/useDatabase'
import { useAI } from '~/composables/useAI'
import { useSuggestions } from '~/composables/useSuggestions'
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
const db = useDatabase()
const ai = useAI()
const { pendingSuggestions, addSuggestion, acceptSuggestion, rejectSuggestion, modifySuggestion } = useSuggestions()

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
const isDemo = ref(false)

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
const handleSendMessage = async (content, attachments = [], context = []) => {
  // Add user message
  const userMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content,
    attachments,
    context,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)
  
  // Save to database
  if (db.createConversation) {
    await db.createConversation({
      project_id: projectId.value,
      messages: messages.value
    })
  } else {
    storage.saveConversation(projectId.value, userMessage)
  }
  
  // Show typing indicator
  const typingMessage = {
    id: 'typing',
    role: 'assistant',
    content: '',
    typing: true
  }
  messages.value.push(typingMessage)
  
  try {
    // Prepare messages for AI (remove typing indicators)
    const aiMessages = messages.value
      .filter(m => !m.typing)
      .map(m => ({
        role: m.role,
        content: m.content
      }))
    
    // Build project context
    const projectContext = {
      name: project.value?.name,
      description: project.value?.description,
      targetAudience: project.value?.target_audience,
      vision: project.value?.vision,
      features: features.value,
      pages: pages.value,
      journeys: journeys.value,
      messageContext: userMessage.context || []
    }
    
    // Use streaming if available
    if (ai.streamMessage) {
      let streamedContent = ''
      const aiMessageId = `msg-${Date.now()}`
      
      // Remove typing indicator and add empty AI message
      messages.value = messages.value.filter(m => m.id !== 'typing')
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }
      messages.value.push(aiMessage)
      
      // Get AI mode from localStorage
      const aiMode = localStorage.getItem('ai-mode') || 'live'
      
      // Stream the response with structured data support
      await ai.streamMessage(
        aiMessages,
        projectContext,
        activeTab.value,
        (chunk) => {
          streamedContent += chunk
          const msgIndex = messages.value.findIndex(m => m.id === aiMessageId)
          if (msgIndex !== -1) {
            messages.value[msgIndex].content = streamedContent
          }
        },
        async () => {
          // Save completed message
          const finalMessage = messages.value.find(m => m.id === aiMessageId)
          if (finalMessage) {
            if (db.updateConversation) {
              await db.updateConversation(projectId.value, {
                messages: messages.value
              })
            } else {
              storage.saveConversation(projectId.value, finalMessage)
            }
          }
        },
        {
          mode: aiMode,
          onSuggestion: (suggestion) => {
            // Add structured suggestions to the queue
            if (suggestion.type && suggestion.data) {
              addSuggestion({
                type: suggestion.type,
                title: suggestion.data.name || suggestion.data.title || 'New ' + suggestion.type,
                description: suggestion.data.description || '',
                preview: suggestion.data,
                data: suggestion.data
              })
            }
          },
          onAction: async (action) => {
            // Handle actions like updating vision, description, etc.
            await handleAIAction(action)
          }
        }
      )
    } else {
      // Fallback to non-streaming
      const response = await ai.sendMessage(aiMessages, projectContext, activeTab.value)
      
      // Remove typing indicator and add AI response
      messages.value = messages.value.filter(m => m.id !== 'typing')
      
      const aiMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      }
      messages.value.push(aiMessage)
      
      if (db.updateConversation) {
        await db.updateConversation(projectId.value, {
          messages: messages.value,
          total_tokens: response.usage?.total_tokens || 0
        })
      } else {
        storage.saveConversation(projectId.value, aiMessage)
      }
      
      // Auto-generate project data based on conversation
      await autoGenerateProjectData(response.content)
    }
  } catch (error) {
    console.error('AI Error:', error)
    
    // Remove typing indicator
    messages.value = messages.value.filter(m => m.id !== 'typing')
    
    // Show error message
    const errorMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'I apologize, but I encountered an error. Please try again or continue with your description.',
      timestamp: new Date().toISOString()
    }
    messages.value.push(errorMessage)
    storage.saveConversation(projectId.value, errorMessage)
  }
}

// Auto-generate all types of project data from AI responses
const autoGenerateProjectData = async (aiContent) => {
  const contentLower = aiContent.toLowerCase()
  
  // Feature patterns and keywords
  const featurePatterns = {
    'authentication': { name: 'User Authentication', category: 'Security', priority: 'high' },
    'login': { name: 'User Login', category: 'Security', priority: 'high' },
    'sign up': { name: 'User Registration', category: 'Security', priority: 'high' },
    'payment': { name: 'Payment Processing', category: 'Commerce', priority: 'high' },
    'checkout': { name: 'Checkout Flow', category: 'Commerce', priority: 'high' },
    'cart': { name: 'Shopping Cart', category: 'Commerce', priority: 'medium' },
    'search': { name: 'Search Functionality', category: 'Discovery', priority: 'medium' },
    'filter': { name: 'Product Filtering', category: 'Discovery', priority: 'medium' },
    'notification': { name: 'Notifications', category: 'Engagement', priority: 'medium' },
    'dashboard': { name: 'Analytics Dashboard', category: 'Analytics', priority: 'medium' },
    'profile': { name: 'User Profile', category: 'User Management', priority: 'medium' },
    'settings': { name: 'User Settings', category: 'User Management', priority: 'low' }
  }
  
  // Page patterns
  const pagePatterns = {
    'home page': { name: 'Home Page', type: 'public', description: 'Main landing page' },
    'landing page': { name: 'Landing Page', type: 'public', description: 'Marketing landing page' },
    'dashboard': { name: 'Dashboard', type: 'auth', description: 'User dashboard' },
    'profile': { name: 'Profile Page', type: 'auth', description: 'User profile management' },
    'settings': { name: 'Settings Page', type: 'auth', description: 'Application settings' },
    'admin': { name: 'Admin Panel', type: 'admin', description: 'Administrative interface' },
    'product page': { name: 'Product Details', type: 'public', description: 'Individual product view' },
    'checkout': { name: 'Checkout Page', type: 'auth', description: 'Payment and order completion' }
  }
  
  // Journey patterns
  const journeyPatterns = {
    'sign up flow': { 
      name: 'User Registration Journey',
      steps: [
        { title: 'Landing Page', description: 'User arrives at the site' },
        { title: 'Sign Up Form', description: 'User fills registration details' },
        { title: 'Email Verification', description: 'User verifies email' },
        { title: 'Profile Setup', description: 'User completes profile' }
      ]
    },
    'purchase flow': {
      name: 'Purchase Journey',
      steps: [
        { title: 'Browse Products', description: 'User explores catalog' },
        { title: 'Add to Cart', description: 'User selects items' },
        { title: 'Checkout', description: 'User enters payment info' },
        { title: 'Order Confirmation', description: 'Purchase complete' }
      ]
    }
  }
  
  // Check for features
  for (const [keyword, featureData] of Object.entries(featurePatterns)) {
    if (contentLower.includes(keyword)) {
      const exists = features.value.find(f => f.name === featureData.name)
      if (!exists) {
        const newFeature = {
          id: `feat-${Date.now()}-${Math.random()}`,
          ...featureData,
          description: 'Discovered from conversation',
          status: 'discovered'
        }
        
        features.value.push(newFeature)
        storage.saveFeature(projectId.value, newFeature)
        break // Only add one item per message
      }
    }
  }
  
  // Check for pages
  for (const [keyword, pageData] of Object.entries(pagePatterns)) {
    if (contentLower.includes(keyword)) {
      const exists = pages.value.find(p => p.name === pageData.name)
      if (!exists) {
        const newPage = {
          id: `page-${Date.now()}-${Math.random()}`,
          ...pageData,
          status: 'design',
          createdAt: new Date().toISOString()
        }
        
        pages.value.push(newPage)
        storage.savePage(projectId.value, newPage)
        break
      }
    }
  }
  
  // Check for journeys
  for (const [keyword, journeyData] of Object.entries(journeyPatterns)) {
    if (contentLower.includes(keyword)) {
      const exists = journeys.value.find(j => j.name === journeyData.name)
      if (!exists) {
        const newJourney = {
          id: `journey-${Date.now()}-${Math.random()}`,
          ...journeyData,
          description: 'User flow discovered from conversation',
          createdAt: new Date().toISOString()
        }
        
        journeys.value.push(newJourney)
        storage.saveJourney(projectId.value, newJourney)
        break
      }
    }
  }
}

// Handle AI actions (vision updates, etc.)
const handleAIAction = async (action) => {
  switch (action.type) {
    case 'update_vision':
      if (project.value && action.data.vision) {
        project.value.vision = action.data.vision
        storage.saveProject(project.value)
      }
      break
      
    case 'update_description':
      if (project.value && action.data.description) {
        project.value.description = action.data.description
        storage.saveProject(project.value)
      }
      break
      
    case 'update_target_audience':
      if (project.value && action.data.targetAudience) {
        project.value.target_audience = action.data.targetAudience
        storage.saveProject(project.value)
      }
      break
      
    case 'create_mockup':
      const newMockup = {
        id: `mockup-${Date.now()}-${Math.random()}`,
        name: action.data.name || 'New Mockup',
        description: action.data.description || '',
        type: action.data.type || 'Page',
        content: action.data.content || '',
        html: action.data.content || '', // Store full HTML content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockups.value.push(newMockup)
      storage.saveMockup(projectId.value, newMockup)
      break
  }
}

// Handle accepted suggestions from ChatPanel
const handleAcceptSuggestion = (suggestion) => {
  switch (suggestion.type) {
    case 'feature':
      const newFeature = {
        id: `feat-${Date.now()}-${Math.random()}`,
        name: suggestion.data?.name || suggestion.title,
        description: suggestion.data?.description || suggestion.description,
        priority: suggestion.data?.priority || suggestion.preview?.priority || 'medium',
        category: suggestion.data?.category || suggestion.preview?.category || 'Suggested Features',
        status: 'discovered'
      }
      features.value.push(newFeature)
      storage.saveFeature(projectId.value, newFeature)
      break
      
    case 'page':
      const newPage = {
        id: `page-${Date.now()}-${Math.random()}`,
        name: suggestion.data?.name || suggestion.title,
        description: suggestion.data?.description || suggestion.description,
        type: suggestion.data?.type || suggestion.preview?.type || 'page',
        sections: suggestion.data?.sections || suggestion.preview?.sections || [],
        status: 'design',
        createdAt: new Date().toISOString()
      }
      pages.value.push(newPage)
      storage.savePage(projectId.value, newPage)
      break
      
    case 'journey':
      const newJourney = {
        id: `journey-${Date.now()}-${Math.random()}`,
        name: suggestion.data?.name || suggestion.title,
        description: suggestion.data?.description || suggestion.description,
        steps: suggestion.data?.steps || suggestion.preview?.steps || [],
        createdAt: new Date().toISOString()
      }
      journeys.value.push(newJourney)
      storage.saveJourney(projectId.value, newJourney)
      break
      
    case 'mockup':
      const newMockup = {
        id: `mockup-${Date.now()}-${Math.random()}`,
        name: suggestion.data?.name || suggestion.title,
        description: suggestion.data?.description || suggestion.description,
        type: suggestion.data?.type || suggestion.preview?.type || 'Page',
        content: suggestion.data?.content || suggestion.preview?.content || '',
        html: suggestion.data?.content || suggestion.preview?.content || '', // Store full HTML
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockups.value.push(newMockup)
      storage.saveMockup(projectId.value, newMockup)
      break
  }
}

// Handle file attachments
const handleAttachment = (file) => {
  console.log('File attached:', file)
  // In a real app, this would process the file
}

// Handle context update from ChatPanel
const handleContextUpdate = (newContext) => {
  // Update local context tracking if needed
  console.log('Context updated:', newContext)
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

// Update chat context from ContentPanel
const updateChatContext = (context) => {
  if (context.type === 'feature') {
    addContext('feature', context.item)
  } else if (context.type === 'page') {
    addContext('page', context.item)
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

// Toggle AI mode between demo and live
const toggleAIMode = () => {
  isDemo.value = !isDemo.value
  localStorage.setItem('ai-mode', isDemo.value ? 'demo' : 'live')
}

// Handle modify suggestion from ContentPanel
const handleModifySuggestion = ({ originalId, modified }) => {
  const updated = modifySuggestion(originalId, modified)
  if (updated) {
    handleAcceptSuggestion(updated)
  }
}

// Handle reject suggestion from ContentPanel
const handleRejectSuggestion = (suggestionId) => {
  rejectSuggestion(suggestionId)
}

// Clear suggestions by type
const clearSuggestionsByType = (type) => {
  // Get all pending suggestions of this type
  const suggestionsOfType = pendingSuggestions.value.filter(s => s.type === type && s.status === 'pending')
  
  // Reject each one
  suggestionsOfType.forEach(s => {
    rejectSuggestion(s.id)
  })
}

// Initialize
onMounted(() => {
  loadProjectData()
  
  // Load AI mode preference
  const savedMode = localStorage.getItem('ai-mode')
  isDemo.value = savedMode === 'demo'
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