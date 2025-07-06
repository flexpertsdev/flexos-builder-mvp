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
          {{ message.content }}
        </div>
      </div>
    </div>
    
    <!-- Input area -->
    <div class="p-4 border-t border-border-primary">
      <form @submit.prevent="sendMessage" class="flex gap-2">
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
          :disabled="!newMessage.trim()"
          class="px-6 py-3 bg-primary text-bg-primary rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
      
      <p class="text-xs text-text-muted mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send'])

const newMessage = ref('')
const messagesContainer = ref(null)
const messageInput = ref(null)

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  emit('send', newMessage.value.trim())
  newMessage.value = ''
  
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
</style>