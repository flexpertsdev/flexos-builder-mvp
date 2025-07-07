export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    hasAnthropicKey: !!config.anthropicApiKey,
    hasOpenAIKey: !!config.openaiApiKey,
    preferredAI: config.anthropicApiKey ? 'Anthropic Claude' : config.openaiApiKey ? 'OpenAI' : 'Mock Mode'
  }
})