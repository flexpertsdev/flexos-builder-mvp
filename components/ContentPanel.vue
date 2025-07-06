<template>
  <div class="flex flex-col h-full">
    <!-- Tabs -->
    <div class="flex border-b border-border-primary flex-shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-change', tab.id)"
        :class="['tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- Tab content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Vision Tab -->
      <div v-if="activeTab === 'vision'" class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold mb-4">Project Vision</h2>
        
        <div class="bg-bg-tertiary rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-2">What You're Building</h3>
          <p class="text-text-secondary">
            An online marketplace for handmade jewelry that connects artisan creators with customers who value unique, personalized pieces.
          </p>
        </div>
        
        <div class="bg-bg-tertiary rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-2">Target Audience</h3>
          <p class="text-text-secondary">
            Young professionals (25-40) who appreciate craftsmanship and want jewelry that tells a story. They value sustainability and supporting small businesses.
          </p>
        </div>
        
        <div class="bg-bg-tertiary rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-2">Key Differentiators</h3>
          <ul class="list-disc list-inside text-text-secondary space-y-2">
            <li>Each piece comes with the artist's story</li>
            <li>Limited edition items create exclusivity</li>
            <li>Customization options for personal touch</li>
            <li>Transparent pricing and ethical sourcing</li>
          </ul>
        </div>
      </div>
      
      <!-- Mockups Tab -->
      <div v-if="activeTab === 'mockups'" class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">Visual Mockups</h2>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-bg-tertiary rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">Homepage</h3>
            <div class="bg-white rounded h-64 flex items-center justify-center text-gray-400">
              <span>Homepage Mockup Preview</span>
            </div>
          </div>
          
          <div class="bg-bg-tertiary rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">Product Gallery</h3>
            <div class="bg-white rounded h-64 flex items-center justify-center text-gray-400">
              <span>Gallery Mockup Preview</span>
            </div>
          </div>
        </div>
        
        <button class="btn btn-secondary">
          + Add New Mockup
        </button>
      </div>
      
      <!-- Features Tab -->
      <div v-if="activeTab === 'features'" class="space-y-6">
        <h2 class="text-2xl font-bold mb-4">Features & Requirements</h2>
        
        <div class="space-y-4">
          <div class="bg-bg-tertiary rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">User Authentication</h3>
              <span class="text-sm text-primary">Essential</span>
            </div>
            <p class="text-text-secondary text-sm">
              Email/password login with social options. Password reset and email verification.
            </p>
          </div>
          
          <div class="bg-bg-tertiary rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Product Catalog</h3>
              <span class="text-sm text-primary">Essential</span>
            </div>
            <p class="text-text-secondary text-sm">
              Grid view with filters for category, price, availability. Each item shows artist info.
            </p>
          </div>
          
          <div class="bg-bg-tertiary rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold">Shopping Cart</h3>
              <span class="text-sm text-primary">Essential</span>
            </div>
            <p class="text-text-secondary text-sm">
              Add/remove items, quantity selection, price calculation with shipping.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Documentation Tab -->
      <div v-if="activeTab === 'docs'" class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold mb-4">Project Documentation</h2>
        
        <div class="bg-bg-tertiary rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Executive Summary</h3>
          <p class="text-text-secondary mb-4">
            This document outlines the complete specifications for building an online marketplace 
            for handmade jewelry. The platform will connect artisan creators with customers who 
            value unique, personalized pieces.
          </p>
          
          <h3 class="text-lg font-semibold mb-4">Technical Overview</h3>
          <ul class="list-disc list-inside text-text-secondary space-y-2 mb-4">
            <li>Frontend: Modern JavaScript framework (React/Vue/Next.js)</li>
            <li>Backend: RESTful API with authentication</li>
            <li>Database: PostgreSQL for relational data</li>
            <li>File Storage: Cloud storage for product images</li>
            <li>Payments: Stripe integration</li>
          </ul>
          
          <h3 class="text-lg font-semibold mb-4">User Flows</h3>
          <p class="text-text-secondary">
            1. Discovery Flow: User browses → Filters products → Views details → Adds to cart<br>
            2. Purchase Flow: Cart review → Checkout → Payment → Order confirmation<br>
            3. Seller Flow: Create listing → Upload photos → Set pricing → Manage orders
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'vision'
  }
})

const emit = defineEmits(['tab-change'])

const tabs = ref([
  { id: 'vision', label: 'Vision' },
  { id: 'mockups', label: 'Mockups' },
  { id: 'features', label: 'Features' },
  { id: 'docs', label: 'Documentation' }
])
</script>