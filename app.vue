<template>
  <div class="min-h-screen bg-bg-primary">
    <NuxtPage />
  </div>
</template>

<script setup>
useHead({
  title: 'FlexOS Builder - From Idea to Documentation in 2 Hours',
  meta: [
    { name: 'description', content: 'Transform your app idea into comprehensive documentation through natural conversation. No technical knowledge required.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' }
  ]
})
</script>
