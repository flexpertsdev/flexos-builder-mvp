import { ref } from 'vue'

export const useAI = () => {
  const isStreaming = ref(false)
  const error = ref('')
  
  // Send a chat message and get a response
  const sendMessage = async (messages: any[], projectContext: any, activeTab: string) => {
    error.value = ''
    
    try {
      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: {
          messages,
          projectContext,
          activeTab
        }
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get response')
      }
      
      return {
        content: response.message,
        usage: response.usage
      }
    } catch (err) {
      error.value = err.message || 'Failed to send message'
      throw err
    }
  }
  
  // Stream a chat response with support for suggestions and actions
  const streamMessage = async (
    messages: any[], 
    projectContext: any, 
    activeTab: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    options?: {
      mode?: 'demo' | 'live',
      onSuggestion?: (suggestion: any) => void,
      onAction?: (action: any) => void
    }
  ) => {
    isStreaming.value = true
    error.value = ''
    
    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          projectContext,
          activeTab,
          mode: options?.mode
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start stream')
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }
      
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          // Handle event-based SSE
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim()
            continue // Next line should be data
          }
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              isStreaming.value = false
              onComplete()
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              
              // Check the previous line for event type
              const prevLine = lines[lines.indexOf(line) - 1]
              const eventType = prevLine?.startsWith('event: ') ? prevLine.slice(7).trim() : null
              
              if (eventType === 'suggestion' && options?.onSuggestion) {
                options.onSuggestion(parsed)
              } else if (eventType === 'action' && options?.onAction) {
                options.onAction(parsed)
              } else if (parsed.content) {
                onChunk(parsed.content)
              } else if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              console.error('Parse error:', e, 'for line:', line)
            }
          }
        }
      }
      
      isStreaming.value = false
      onComplete()
    } catch (err) {
      isStreaming.value = false
      error.value = err.message || 'Failed to stream message'
      throw err
    }
  }
  
  // Generate project insights based on current state
  const generateInsights = async (projectData: any, insightType: string) => {
    try {
      const systemPrompt = getInsightPrompt(insightType, projectData)
      
      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: {
          messages: [
            { role: 'user', content: `Generate ${insightType} insights for this project` }
          ],
          projectContext: projectData,
          activeTab: insightType
        }
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate insights')
      }
      
      return response.message
    } catch (err) {
      error.value = err.message || 'Failed to generate insights'
      throw err
    }
  }
  
  return {
    sendMessage,
    streamMessage,
    generateInsights,
    isStreaming: readonly(isStreaming),
    error: readonly(error)
  }
}

function getInsightPrompt(insightType: string, projectData: any) {
  const prompts = {
    vision: `Analyze the project vision and suggest improvements or clarifications needed.`,
    features: `Review the discovered features and suggest missing critical features for MVP.`,
    userFlow: `Analyze the user journeys and identify gaps or optimization opportunities.`,
    technical: `Review the technical requirements and suggest architecture considerations.`,
    market: `Analyze the market positioning and competitive advantages.`
  }
  
  return prompts[insightType] || prompts.vision
}