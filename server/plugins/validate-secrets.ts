// This plugin ensures API keys are only accessed at runtime
export default defineNitroPlugin((nitroApp) => {
  // Validate that sensitive keys are not exposed
  if (process.env.NODE_ENV === 'production') {
    const config = useRuntimeConfig()
    
    // These should be undefined or empty in production builds
    if (config.openaiApiKey && config.openaiApiKey.startsWith('sk-')) {
      console.warn('Warning: OpenAI API key may be exposed in build')
    }
    
    if (config.anthropicApiKey && config.anthropicApiKey.startsWith('sk-ant-')) {
      console.warn('Warning: Anthropic API key may be exposed in build')
    }
  }
})