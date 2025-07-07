export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const openaiKey = process.env.OPENAI_API_KEY || config.openaiApiKey || ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY || config.anthropicApiKey || ''
  
  return {
    hasAnthropicKey: !!anthropicKey,
    hasOpenAIKey: !!openaiKey,
    preferredAI: anthropicKey ? 'Anthropic Claude' : openaiKey ? 'OpenAI' : 'Mock Mode'
  }
})