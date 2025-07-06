<template>
  <div class="h-screen flex flex-col bg-bg-primary">
    <!-- Header -->
    <header class="bg-bg-secondary border-b border-border-primary flex-shrink-0">
      <div class="px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            @click="$router.push('/dashboard')"
            class="text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
          <h1 class="text-xl font-semibold">{{ projectName }}</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <button 
            @click="enterFocusMode"
            class="btn btn-secondary text-sm"
          >
            Focus Mode
          </button>
          <button class="btn btn-primary text-sm">
            Export Docs
          </button>
        </div>
      </div>
    </header>
    
    <!-- Two-panel layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Chat (40%) -->
      <div class="w-2/5 flex flex-col bg-bg-primary border-r border-border-primary">
        <ChatPanel 
          :messages="messages" 
          @send="handleSendMessage"
        />
      </div>
      
      <!-- Right Panel: Content (60%) -->
      <div class="w-3/5 flex flex-col bg-bg-secondary">
        <ContentPanel 
          :activeTab="activeTab"
          @tab-change="activeTab = $event"
        />
      </div>
    </div>
    
    <!-- Focus Mode Overlay -->
    <FocusMode 
      v-if="showFocusMode"
      :messages="messages"
      @send="handleSendMessage"
      @close="showFocusMode = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ChatPanel from '~/components/ChatPanel.vue'
import ContentPanel from '~/components/ContentPanel.vue'
import FocusMode from '~/components/FocusMode.vue'

// Use auth middleware
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const projectId = computed(() => route.params.id)
const projectName = ref('New Project')
const activeTab = ref('vision')
const showFocusMode = ref(false)

// Mock messages for the conversation
const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: "Hi! I'm here to help you transform your idea into comprehensive documentation. What would you like to build?"
  }
])

// Mock AI responses
const aiResponses = [
  "That's interesting! Tell me more about your target customers.",
  "What problem does this solve for them?",
  "How do you envision users discovering your product?",
  "What would make your solution unique?",
  "Let's think about the user journey. What happens after they sign up?",
  "What features are absolutely essential for launch?",
  "How do you see this scaling as you grow?",
  "What kind of experience do you want your users to have?",
  "Have you thought about how users will pay or subscribe?",
  "What's the main goal users want to achieve with your app?"
]

let responseIndex = 0

const handleSendMessage = async (content) => {
  // Add user message
  messages.value.push({
    id: messages.value.length + 1,
    role: 'user',
    content
  })
  
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
  messages.value.push({
    id: messages.value.length + 1,
    role: 'assistant',
    content: aiResponses[responseIndex % aiResponses.length]
  })
  
  responseIndex++
}

const enterFocusMode = () => {
  showFocusMode.value = true
}
</script>