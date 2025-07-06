<template>
  <div class="fixed inset-0 z-50 bg-gradient-to-br from-accent via-bg-primary to-bg-primary flex items-center justify-center p-6">
    <!-- Escape hint -->
    <div class="absolute top-6 left-1/2 transform -translate-x-1/2 bg-bg-secondary bg-opacity-80 backdrop-blur px-4 py-2 rounded-full text-sm text-text-secondary">
      Press <kbd class="px-2 py-0.5 bg-bg-tertiary rounded text-xs">ESC</kbd> to exit focus mode
    </div>
    
    <div class="w-full max-w-3xl h-[80vh] bg-bg-secondary rounded-2xl shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border-primary">
        <div>
          <h2 class="text-2xl font-bold">Focus Mode</h2>
          <p class="text-text-secondary">Distraction-free discovery conversation</p>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Session timer -->
          <div class="text-sm text-text-secondary">
            <span>Session: </span>
            <span class="font-mono">{{ formatTime(sessionTime) }}</span>
          </div>
          
          <button
            @click="$emit('close')"
            class="text-text-secondary hover:text-text-primary transition-colors text-2xl"
          >
            ×
          </button>
        </div>
      </div>
      
      <!-- Chat area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="messagesContainer">
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
            {{ message.content }}
          </div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="p-6 border-t border-border-primary">
        <form @submit.prevent="sendMessage" class="flex gap-3">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="handleEnter"
            placeholder="Tell me about your idea... What problem are you trying to solve?"
            class="flex-1 px-5 py-4 bg-bg-tertiary border border-border-primary rounded-xl resize-none focus:border-accent focus:outline-none transition-colors text-lg"
            rows="2"
            ref="messageInput"
            autofocus
          ></textarea>
          
          <button
            type="submit"
            :disabled="!newMessage.trim()"
            class="px-8 py-4 bg-accent text-white rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </form>
        
        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-text-muted">
            Press Enter to send, Shift+Enter for new line
          </p>
          
          <button
            @click="$emit('close')"
            class="btn btn-secondary text-sm"
          >
            I'm Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'

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

const emit = defineEmits(['send', 'close'])

const newMessage = ref('')
const messageInput = ref(null)
const messagesContainer = ref(null)
const sessionTime = ref(0)
let sessionInterval = null

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  emit('send', newMessage.value.trim())
  newMessage.value = ''
}

const handleEnter = (event) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Start session timer
onMounted(() => {
  sessionInterval = setInterval(() => {
    sessionTime.value++
  }, 1000)
})

onUnmounted(() => {
  if (sessionInterval) {
    clearInterval(sessionInterval)
  }
})

// Focus input on mount
onMounted(() => {
  messageInput.value?.focus()
})

// Auto-resize textarea
watch(newMessage, () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 200) + 'px'
    }
  })
})

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})

// Handle escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Larger text in focus mode */
.message-user,
.message-ai {
  @apply text-lg;
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

/* Keyboard style */
kbd {
  font-family: monospace;
  font-weight: 600;
  border: 1px solid var(--border-primary);
}
</style>