<template>
  <div class="fixed inset-0 z-50 bg-gradient-to-br from-accent via-bg-primary to-bg-primary flex items-center justify-center p-6">
    <div class="w-full max-w-3xl h-[80vh] bg-bg-secondary rounded-2xl shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border-primary">
        <div>
          <h2 class="text-2xl font-bold">Focus Mode</h2>
          <p class="text-text-secondary">Distraction-free conversation</p>
        </div>
        
        <button
          @click="$emit('close')"
          class="text-text-secondary hover:text-text-primary transition-colors text-2xl"
        >
          ×
        </button>
      </div>
      
      <!-- Chat area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
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
            placeholder="Share your thoughts..."
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send', 'close'])

const newMessage = ref('')
const messageInput = ref(null)

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
</style>