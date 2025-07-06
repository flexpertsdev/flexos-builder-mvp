<template>
  <div class="flex flex-col h-full">
    <!-- Messages area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
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
    
    <!-- Attached files preview -->
    <div v-if="attachedFiles.length > 0" class="px-4 pb-2">
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
    <div class="p-4 border-t border-border-primary">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <!-- File attachment button -->
        <button
          type="button"
          @click="$refs.fileInput.click()"
          class="p-3 text-text-secondary hover:text-text-primary transition-colors"
          title="Attach file"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        
        <!-- Hidden file input -->
        <input 
          ref="fileInput"
          type="file" 
          multiple
          @change="handleFileSelect"
          class="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.json"
        />
        
        <textarea
          v-model="newMessage"
          @keydown.enter.prevent="handleEnter"
          placeholder="Type your message..."
          class="flex-1 px-4 py-3 bg-bg-tertiary border border-border-primary rounded-full resize-none focus:border-primary focus:outline-none transition-colors"
          rows="1"
          ref="messageInput"
        ></textarea>
        
        <button
          type="submit"
          :disabled="!canSend"
          class="px-6 py-3 bg-primary text-bg-primary rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
      
      <p class="text-xs text-text-muted mt-2">
        Press Enter to send, Shift+Enter for new line • Attach screenshots, PDFs, or documents
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  context: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['send', 'attach'])

const newMessage = ref('')
const messagesContainer = ref(null)
const messageInput = ref(null)
const fileInput = ref(null)
const attachedFiles = ref([])

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
    }))
  }
  
  emit('send', messageData.content || 'Attached files', messageData.attachments)
  
  newMessage.value = ''
  attachedFiles.value = []
  
  // Auto-resize textarea
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
  })
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