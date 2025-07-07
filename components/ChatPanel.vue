<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Suggestion cards -->
    <div v-if="pendingSuggestions.length > 0" class="border-b border-border-primary bg-bg-secondary p-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-text-secondary">AI Suggestions</h3>
        <button 
          @click="clearRejected"
          class="text-xs text-text-muted hover:text-text-primary"
        >
          Clear rejected
        </button>
      </div>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <SuggestionCard
          v-for="suggestion in pendingSuggestions"
          :key="suggestion.id"
          :suggestion="suggestion"
          @accept="handleAcceptSuggestion"
          @modify="handleModifySuggestion"
          @reject="handleRejectSuggestion"
        />
      </div>
    </div>
    
    <!-- Messages area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex gap-3"
        :class="message.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <!-- Avatar -->
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          :class="message.role === 'user' ? 'bg-bg-quaternary text-text-primary' : 'bg-primary text-bg-primary'"
        >
          {{ message.role === 'user' ? 'U' : 'AI' }}
        </div>
        
        <!-- Message content -->
        <div class="flex-1 max-w-[85%]">
          <div v-if="message.typing" class="message-ai flex items-center gap-2 px-4 py-3">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-text-muted rounded-full typing-dot"></div>
              <div class="w-2 h-2 bg-text-muted rounded-full typing-dot"></div>
              <div class="w-2 h-2 bg-text-muted rounded-full typing-dot"></div>
            </div>
          </div>
          
          <div v-else :class="message.role === 'user' ? 'message-user' : 'message-ai'">
            <div v-if="message.attachments?.length" class="mb-2 flex flex-wrap gap-2">
              <div 
                v-for="attachment in message.attachments" 
                :key="attachment.id"
                class="text-xs bg-bg-quaternary px-2 py-1 rounded flex items-center gap-1"
              >
                <span>📎</span>
                <span>{{ attachment.name }}</span>
              </div>
            </div>
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Attached files preview -->
    <div v-if="attachedFiles.length > 0" class="px-4 pb-2 flex-shrink-0">
      <div class="bg-bg-tertiary rounded-lg p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-text-secondary">Attached files:</span>
          <button 
            @click="clearAttachments"
            class="text-xs text-text-muted hover:text-text-primary"
          >
            Clear all
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="(file, index) in attachedFiles" 
            :key="index"
            class="text-xs bg-bg-quaternary px-2 py-1 rounded flex items-center gap-1"
          >
            <span>{{ getFileIcon(file.type) }}</span>
            <span>{{ file.name }}</span>
            <button 
              @click="removeAttachment(index)"
              class="ml-1 hover:text-error"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input area -->
    <div class="border-t border-border-primary flex-shrink-0">
      <!-- Context bar -->
      <div v-if="contextItems.length > 0" class="px-4 pt-3 pb-2">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="item in contextItems" 
            :key="item.id"
            class="context-item"
          >
            <svg v-if="item.type === 'feature'" class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <svg v-else-if="item.type === 'page'" class="w-4 h-4 text-info" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="7" height="9" x="3" y="3" rx="1"/>
              <rect width="7" height="5" x="14" y="3" rx="1"/>
            </svg>
            <svg v-else-if="item.type === 'journey'" class="w-4 h-4 text-warning" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22,8 22,2 16,2"/>
              <line x1="16" y1="8" x2="22" y2="2"/>
              <path d="M22 17V14A10 10 0 0 0 12 4h-1"/>
            </svg>
            <span class="text-sm">{{ item.name }}</span>
            <button 
              @click="removeContextItem(item.id)"
              class="ml-1 text-text-muted hover:text-error transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-4">
        <form @submit.prevent="sendMessage" class="relative">
          <div class="bg-bg-tertiary border border-border-primary rounded-full flex items-end gap-2 px-2 py-2 transition-all focus-within:border-primary">
            <!-- Enhanced attach button -->
            <button
              type="button"
              @click="toggleContextMenu"
              class="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-quaternary rounded-full transition-all"
              title="Add context or files"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            
            <textarea
              v-model="newMessage"
              @keydown.enter.prevent="handleEnter"
              placeholder="Discuss your project at a high level..."
              class="flex-1 bg-transparent resize-none focus:outline-none text-sm py-1"
              rows="1"
              ref="messageInput"
            ></textarea>
            
            <button
              v-show="canSend"
              type="submit"
              class="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </button>
          </div>
          
          <!-- Context Menu -->
          <div 
            v-if="showContextMenu" 
            class="absolute bottom-full left-0 mb-2 bg-bg-secondary border border-border-primary rounded-xl shadow-lg w-72 max-h-96 overflow-y-auto"
          >
            <!-- Upload Files Section -->
            <div class="p-2">
              <div class="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Upload Files
              </div>
              <button
                @click="selectFiles"
                class="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-3"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                Screenshots & Documents
              </button>
            </div>
            
            <div class="border-t border-border-primary"></div>
            
            <!-- Project Elements Section -->
            <div class="p-2">
              <div class="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Project Elements
              </div>
              
              <!-- Features -->
              <div v-if="availableFeatures.length > 0">
                <div class="px-3 py-1 text-xs text-text-muted">Features</div>
                <button
                  v-for="feature in availableFeatures"
                  :key="feature.id"
                  @click="addContextItem({ ...feature, type: 'feature' })"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-3"
                >
                  <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  {{ feature.name }}
                </button>
              </div>
              
              <!-- Pages -->
              <div v-if="availablePages.length > 0" class="mt-2">
                <div class="px-3 py-1 text-xs text-text-muted">Pages</div>
                <button
                  v-for="page in availablePages"
                  :key="page.id"
                  @click="addContextItem({ ...page, type: 'page' })"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-3"
                >
                  <svg class="w-4 h-4 text-info" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                  </svg>
                  {{ page.name }}
                </button>
              </div>
              
              <!-- Journeys -->
              <div v-if="availableJourneys.length > 0" class="mt-2">
                <div class="px-3 py-1 text-xs text-text-muted">User Journeys</div>
                <button
                  v-for="journey in availableJourneys"
                  :key="journey.id"
                  @click="addContextItem({ ...journey, type: 'journey' })"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-3"
                >
                  <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22,8 22,2 16,2"/>
                    <line x1="16" y1="8" x2="22" y2="2"/>
                    <path d="M22 17V14A10 10 0 0 0 12 4h-1"/>
                  </svg>
                  {{ journey.name }}
                </button>
              </div>
            </div>
          </div>
        </form>
        
        <!-- Hidden file input -->
        <input 
          ref="fileInput"
          type="file" 
          multiple
          @change="handleFileSelect"
          class="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.json"
        />
        
        <p class="text-xs text-text-muted mt-2">
          Press Enter to send, Shift+Enter for new line • Attach screenshots, PDFs, or documents
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed, onMounted, onUnmounted } from 'vue'
import SuggestionCard from './SuggestionCard.vue'
import { useSuggestions } from '~/composables/useSuggestions'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  context: {
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
  }
})

const emit = defineEmits(['send', 'attach', 'updateContext', 'acceptSuggestion'])

// Composables
const { 
  pendingSuggestions, 
  addSuggestion, 
  acceptSuggestion, 
  rejectSuggestion, 
  modifySuggestion,
  clearRejected,
  parseAISuggestions 
} = useSuggestions()

const newMessage = ref('')
const messagesContainer = ref(null)
const messageInput = ref(null)
const fileInput = ref(null)
const attachedFiles = ref([])
const showContextMenu = ref(false)
const contextItems = ref([])

// Available items for context menu (not already in context)
const availableFeatures = computed(() => 
  props.features.filter(f => !contextItems.value.find(c => c.id === f.id && c.type === 'feature'))
)

const availablePages = computed(() => 
  props.pages.filter(p => !contextItems.value.find(c => c.id === p.id && c.type === 'page'))
)

const availableJourneys = computed(() => 
  props.journeys.filter(j => !contextItems.value.find(c => c.id === j.id && c.type === 'journey'))
)

// Can send if there's a message or attachments
const canSend = computed(() => {
  return newMessage.value.trim() || attachedFiles.value.length > 0
})

const sendMessage = () => {
  if (!canSend.value) return
  
  const messageData = {
    content: newMessage.value.trim(),
    attachments: attachedFiles.value.map(file => ({
      id: `attach-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size
    })),
    context: contextItems.value
  }
  
  emit('send', messageData.content || 'Attached files', messageData.attachments, messageData.context)
  
  newMessage.value = ''
  attachedFiles.value = []
  
  // Auto-resize textarea
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
  })
}

// Toggle context menu
const toggleContextMenu = () => {
  showContextMenu.value = !showContextMenu.value
}

// Add context item
const addContextItem = (item) => {
  contextItems.value.push(item)
  emit('updateContext', contextItems.value)
  showContextMenu.value = false
}

// Remove context item
const removeContextItem = (itemId) => {
  contextItems.value = contextItems.value.filter(item => item.id !== itemId)
  emit('updateContext', contextItems.value)
}

// Select files
const selectFiles = () => {
  fileInput.value?.click()
  showContextMenu.value = false
}

const handleEnter = (event) => {
  if (!event.shiftKey) {
    sendMessage()
  } else {
    // Allow shift+enter for new line
    newMessage.value += '\n'
  }
}

// File handling
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  attachedFiles.value.push(...files)
  
  // Emit files for processing
  files.forEach(file => {
    emit('attach', file)
  })
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeAttachment = (index) => {
  attachedFiles.value.splice(index, 1)
}

const clearAttachments = () => {
  attachedFiles.value = []
}

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return '🖼️'
  if (type.includes('pdf')) return '📄'
  if (type.includes('document') || type.includes('doc')) return '📝'
  if (type.includes('sheet') || type.includes('csv')) return '📊'
  return '📎'
}

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})

// Auto-resize textarea as user types
watch(newMessage, () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
    }
  })
})

// Close context menu on outside click
const handleClickOutside = (event) => {
  const contextMenuEl = event.target.closest('.context-menu')
  const attachBtn = event.target.closest('button[title="Add context or files"]')
  
  if (!contextMenuEl && !attachBtn && showContextMenu.value) {
    showContextMenu.value = false
  }
}

// Add click listener on mount
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Remove click listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Suggestion handlers
const handleAcceptSuggestion = (suggestion) => {
  const accepted = acceptSuggestion(suggestion.id)
  if (accepted) {
    emit('acceptSuggestion', accepted)
  }
}

const handleModifySuggestion = ({ originalId, modified }) => {
  const updated = modifySuggestion(originalId, modified)
  if (updated) {
    emit('acceptSuggestion', updated)
  }
}

const handleRejectSuggestion = (suggestionId) => {
  rejectSuggestion(suggestionId)
}

// Watch for new AI messages to parse suggestions
watch(() => props.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages?.length) {
    const latestMessage = newMessages[newMessages.length - 1]
    if (latestMessage.role === 'assistant' && !latestMessage.typing) {
      // Parse AI response for suggestions
      const suggestions = parseAISuggestions(latestMessage.content)
      suggestions.forEach(suggestion => {
        addSuggestion(suggestion)
      })
    }
  }
}, { deep: true })
</script>

<style scoped>
/* Override textarea to look like WhatsApp input */
textarea {
  min-height: 44px;
  max-height: 120px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

/* Typing animation */
@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.typing-dot {
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
</style>