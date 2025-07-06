<template>
  <div class="min-h-screen flex flex-col">
    <!-- Simple Hero Section -->
    <div class="flex-1 flex items-center justify-center px-6">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          From confused idea to complete documentation
          <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> in under 2 hours</span>
        </h1>
        
        <p class="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Transform your app idea into comprehensive documentation through natural conversation. 
          No technical knowledge required.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="$router.push('/login')"
            class="btn btn-primary shadow-lg hover:shadow-xl"
          >
            <span>Start Your Free Session</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          
          <button 
            @click="scrollToDemo"
            class="btn btn-secondary"
          >
            See How It Works
          </button>
        </div>
        
        <p class="text-text-muted mt-6">
          No credit card required • 3 free projects
        </p>
      </div>
    </div>
    
    <!-- Simple How It Works -->
    <div id="demo" class="py-24 px-6 bg-bg-secondary">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-16">How It Works</h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-bg-primary">
              1
            </div>
            <h3 class="text-xl font-semibold mb-2">Have a Conversation</h3>
            <p class="text-text-secondary">
              Tell us about your idea in your own words. We'll ask the right questions.
            </p>
          </div>
          
          <!-- Step 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-bg-primary">
              2
            </div>
            <h3 class="text-xl font-semibold mb-2">See It Come to Life</h3>
            <p class="text-text-secondary">
              Watch as your ideas transform into visual mockups and organized features.
            </p>
          </div>
          
          <!-- Step 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-bg-primary">
              3
            </div>
            <h3 class="text-xl font-semibold mb-2">Get Complete Documentation</h3>
            <p class="text-text-secondary">
              Receive comprehensive specs that any developer or AI can use to build your app.
            </p>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <button 
            @click="$router.push('/login')"
            class="btn btn-primary text-lg"
          >
            Try It Free
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>