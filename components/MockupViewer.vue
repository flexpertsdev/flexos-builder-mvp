<template>
  <div class="flex flex-col h-full bg-bg-primary">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-border-primary">
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 class="text-lg font-semibold">{{ mockup.name }}</h2>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Device preview buttons -->
        <div class="flex bg-bg-tertiary rounded-lg p-1">
          <button
            v-for="device in devices"
            :key="device.id"
            @click="activeDevice = device.id"
            :class="[
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              activeDevice === device.id 
                ? 'bg-bg-quaternary text-text-primary' 
                : 'text-text-secondary hover:text-text-primary'
            ]"
          >
            {{ device.label }}
          </button>
        </div>
        
        <!-- Actions -->
        <button 
          @click="$emit('edit', mockup)"
          class="btn btn-secondary text-sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button 
          @click="exportMockup"
          class="btn btn-primary text-sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
    
    <!-- Device frame and viewport -->
    <div class="flex-1 overflow-hidden bg-bg-secondary p-8">
      <div class="h-full flex items-center justify-center">
        <div 
          :class="[
            'relative bg-white rounded-lg shadow-2xl transition-all duration-300',
            deviceFrameClass
          ]"
        >
          <!-- Device frame decoration -->
          <div v-if="activeDevice === 'mobile'" class="absolute inset-x-0 top-0 h-6 bg-gray-900 rounded-t-lg">
            <div class="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
          </div>
          
          <!-- Viewport -->
          <div :class="['overflow-hidden', deviceViewportClass]">
            <iframe
              ref="iframe"
              :srcdoc="mockupContent"
              class="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              @load="onIframeLoad"
            ></iframe>
          </div>
          
          <!-- Mobile home indicator -->
          <div v-if="activeDevice === 'mobile'" class="absolute inset-x-0 bottom-0 h-6 bg-gray-900 rounded-b-lg flex items-center justify-center">
            <div class="w-32 h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Info panel -->
    <div class="border-t border-border-primary p-4 bg-bg-tertiary">
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-4 text-text-secondary">
          <span>{{ mockup.type }} Mockup</span>
          <span>•</span>
          <span>Last updated: {{ formatDate(mockup.updatedAt) }}</span>
          <span>•</span>
          <span>{{ getCurrentDimensions() }}</span>
        </div>
        <div class="text-text-muted">
          {{ mockup.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  mockup: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit'])

// Device preview
const devices = [
  { id: 'desktop', label: 'Desktop', width: '100%', height: '100%' },
  { id: 'tablet', label: 'Tablet', width: '768px', height: '1024px' },
  { id: 'mobile', label: 'Mobile', width: '375px', height: '812px' }
]

const activeDevice = ref('desktop')
const iframe = ref(null)

// Computed styles for device frames
const deviceFrameClass = computed(() => {
  switch (activeDevice.value) {
    case 'mobile':
      return 'w-[375px] h-[812px] border-8 border-gray-900'
    case 'tablet':
      return 'w-[768px] h-[1024px] border-8 border-gray-800'
    default:
      return 'w-full h-full max-w-6xl max-h-[90%]'
  }
})

const deviceViewportClass = computed(() => {
  switch (activeDevice.value) {
    case 'mobile':
      return 'rounded-lg'
    case 'tablet':
      return 'rounded-lg'
    default:
      return 'rounded-lg h-full'
  }
})

// Mockup content with responsive meta tag injection
const mockupContent = computed(() => {
  const content = props.mockup.html || props.mockup.content || ''
  
  // If it's already a complete HTML document, return as is
  if (content.includes('<!DOCTYPE html>')) {
    return content
  }
  
  // Otherwise, wrap in a basic HTML structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.mockup.name}</title>
    <style>
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
})

// Get current dimensions
const getCurrentDimensions = () => {
  const device = devices.find(d => d.id === activeDevice.value)
  if (device.id === 'desktop') {
    return 'Responsive'
  }
  return `${device.width} × ${device.height}`
}

// Handle iframe load
const onIframeLoad = () => {
  // Optional: Add any post-load handling
  console.log('Mockup loaded:', props.mockup.name)
}

// Export mockup
const exportMockup = () => {
  const blob = new Blob([mockupContent.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.mockup.name.toLowerCase().replace(/\s+/g, '-')}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>