import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, projectContext, activeTab } = body
  
  // Get runtime config
  const config = useRuntimeConfig()
  const openaiKey = config.openaiApiKey
  const anthropicKey = config.anthropicApiKey
  
  // Check if in demo mode
  if (!openaiKey && !anthropicKey) {
    // Return mock response for demo mode
    return {
      success: true,
      message: getMockResponse(messages, activeTab),
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150
      }
    }
  }
  
  try {
    // Use Anthropic if available, otherwise OpenAI
    if (anthropicKey) {
      return await handleAnthropicChat(anthropicKey, messages, projectContext, activeTab)
    } else {
      return await handleOpenAIChat(openaiKey, messages, projectContext, activeTab)
    }
  } catch (error) {
    console.error('AI API Error:', error)
    return {
      success: false,
      error: 'Failed to process message. Please try again.'
    }
  }
})

async function handleOpenAIChat(apiKey: string, messages: any[], projectContext: any, activeTab: string) {
  const openai = new OpenAI({ apiKey })
  
  // Build system prompt based on active tab
  const systemPrompt = buildSystemPrompt(activeTab, projectContext)
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
  
  return {
    success: true,
    message: completion.choices[0].message.content,
    usage: completion.usage
  }
}

async function handleAnthropicChat(apiKey: string, messages: any[], projectContext: any, activeTab: string) {
  const anthropic = new Anthropic({ apiKey })
  
  // Build system prompt based on active tab
  const systemPrompt = buildSystemPrompt(activeTab, projectContext)
  
  // Convert messages to Anthropic format
  const anthropicMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }))
  
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: anthropicMessages
  })
  
  return {
    success: true,
    message: response.content[0].text,
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    }
  }
}

function buildSystemPrompt(activeTab: string, projectContext: any) {
  const basePrompt = `You are FlexOS Builder, an AI assistant helping non-technical founders transform their app ideas into comprehensive documentation. You ask insightful questions to discover requirements, suggest features, and help clarify the vision.

Current project context:
- Name: ${projectContext.name || 'Untitled Project'}
- Description: ${projectContext.description || 'No description yet'}
- Target Audience: ${projectContext.targetAudience || 'Not defined'}
- Vision: ${projectContext.vision || 'Not defined'}`

  const tabPrompts = {
    vision: `
You are currently helping define the project vision. Focus on:
- Understanding the core problem being solved
- Identifying target users and their pain points
- Clarifying the unique value proposition
- Exploring market differentiators`,
    
    mockups: `
You are currently discussing mockups and UI design. Focus on:
- Understanding user workflows
- Suggesting UI patterns and layouts
- Discussing visual hierarchy
- Identifying key screens and interactions`,
    
    features: `
You are currently discovering and defining features. Focus on:
- Breaking down requirements into specific features
- Prioritizing features (MVP vs future)
- Understanding technical requirements
- Creating user stories`,
    
    docs: `
You are currently reviewing documentation. Focus on:
- Ensuring completeness
- Identifying gaps
- Suggesting improvements
- Validating technical feasibility`
  }
  
  return basePrompt + (tabPrompts[activeTab] || tabPrompts.vision)
}

function getMockResponse(messages: any[], activeTab: string) {
  const mockResponses = {
    vision: [
      "That's a great vision! Can you tell me more about the specific problem this solves for your users?",
      "Interesting! How do you see this being different from existing solutions in the market?",
      "I love the direction this is going. What would be the single most important outcome for your users?",
      "Let's dig deeper into your target audience. Who specifically would benefit most from this?",
      "That makes sense. What inspired you to solve this particular problem?"
    ],
    mockups: [
      "For the user interface, what's the most important action users need to take?",
      "How do you envision users navigating through your app? What's the main user flow?",
      "Should we prioritize mobile or desktop experience first?",
      "What visual style appeals to your target audience - minimal, playful, professional?",
      "Let's think about the first screen users see. What would make them want to explore further?"
    ],
    features: [
      "What feature would provide the most immediate value to your users?",
      "That's a great feature idea! How do you see users interacting with it?",
      "Should this feature be part of the MVP or saved for a future release?",
      "What data would this feature need to work effectively?",
      "How would you measure the success of this feature?"
    ],
    docs: [
      "Looking at the documentation, I notice we should expand on the user authentication flow.",
      "The feature list is coming together nicely. Should we add more detail about the payment processing?",
      "I've organized the requirements into clear sections. What technical constraints should we document?",
      "The documentation is quite comprehensive. Are there any edge cases we should consider?",
      "Great progress! Should we add more details about the data model?"
    ]
  }
  
  const responses = mockResponses[activeTab] || mockResponses.vision
  const messageCount = messages.filter(m => m.role === 'user').length
  return responses[messageCount % responses.length]
}