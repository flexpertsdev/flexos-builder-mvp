import { ref, computed, readonly } from 'vue'

interface Suggestion {
  id: string
  type: 'feature' | 'page' | 'journey' | 'mockup'
  title: string
  description: string
  preview?: any
  timestamp: string
  status: 'pending' | 'accepted' | 'rejected' | 'modified'
}

interface ModifiedSuggestion {
  originalId: string
  modified: Suggestion
}

export const useSuggestions = () => {
  // Suggestion queue
  const suggestions = ref<Suggestion[]>([])
  
  // Computed properties
  const pendingSuggestions = computed(() => 
    suggestions.value.filter(s => s.status === 'pending')
  )
  
  const acceptedSuggestions = computed(() => 
    suggestions.value.filter(s => s.status === 'accepted')
  )
  
  const hasPendingSuggestions = computed(() => 
    pendingSuggestions.value.length > 0
  )
  
  // Add a new suggestion to the queue
  const addSuggestion = (suggestion: Omit<Suggestion, 'id' | 'timestamp' | 'status'>) => {
    const newSuggestion: Suggestion = {
      ...suggestion,
      id: `suggestion-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    suggestions.value.unshift(newSuggestion)
    return newSuggestion
  }
  
  // Accept a suggestion
  const acceptSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    if (suggestion) {
      suggestion.status = 'accepted'
      return suggestion
    }
    return null
  }
  
  // Reject a suggestion
  const rejectSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    if (suggestion) {
      suggestion.status = 'rejected'
    }
  }
  
  // Modify a suggestion
  const modifySuggestion = (originalId: string, modifiedData: Partial<Suggestion>) => {
    const index = suggestions.value.findIndex(s => s.id === originalId)
    if (index !== -1) {
      suggestions.value[index] = {
        ...suggestions.value[index],
        ...modifiedData,
        status: 'modified'
      }
      return suggestions.value[index]
    }
    return null
  }
  
  // Clear all suggestions
  const clearSuggestions = () => {
    suggestions.value = []
  }
  
  // Clear rejected suggestions
  const clearRejected = () => {
    suggestions.value = suggestions.value.filter(s => s.status !== 'rejected')
  }
  
  // Parse AI response for suggestions
  const parseAISuggestions = (aiResponse: string): Suggestion[] => {
    const parsedSuggestions: Suggestion[] = []
    
    // Feature detection patterns
    const featurePatterns = [
      /I (?:suggest|recommend|think you need|would add) (?:a |an |the )?(.+?) feature/gi,
      /You (?:might want|should consider|could add) (?:a |an |the )?(.+?) feature/gi,
      /How about (?:adding |implementing )?(.+?)\?/gi,
      /(?:Feature suggestion|Recommendation):\s*(.+?)(?:\.|$)/gi
    ]
    
    // Page detection patterns
    const pagePatterns = [
      /You'll need (?:a |an |the )?(.+?) (?:page|screen)/gi,
      /Create (?:a |an |the )?(.+?) (?:page|screen)/gi,
      /(?:Page|Screen) suggestion:\s*(.+?)(?:\.|$)/gi
    ]
    
    // Journey detection patterns
    const journeyPatterns = [
      /User journey:\s*(.+?)(?:\.|$)/gi,
      /(?:When|After) (?:a |the )?user (.+?),/gi,
      /The flow (?:would be|should be):\s*(.+?)(?:\.|$)/gi
    ]
    
    // Check for feature suggestions
    featurePatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          parsedSuggestions.push({
            type: 'feature',
            title: match[1].trim(),
            description: `Suggested feature based on our conversation`,
            preview: {
              priority: 'medium',
              category: 'Suggested Features'
            }
          } as any)
        }
      }
    })
    
    // Check for page suggestions
    pagePatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          parsedSuggestions.push({
            type: 'page',
            title: match[1].trim(),
            description: `Suggested page to include in your app`,
            preview: {
              type: 'page',
              sections: []
            }
          } as any)
        }
      }
    })
    
    // Check for journey suggestions
    journeyPatterns.forEach(pattern => {
      const matches = aiResponse.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          parsedSuggestions.push({
            type: 'journey',
            title: 'User Journey',
            description: match[1].trim(),
            preview: {
              steps: []
            }
          } as any)
        }
      }
    })
    
    // Deduplicate suggestions by title
    const uniqueSuggestions = parsedSuggestions.reduce((acc, curr) => {
      if (!acc.find(s => s.title === curr.title && s.type === curr.type)) {
        acc.push(curr)
      }
      return acc
    }, [] as Suggestion[])
    
    return uniqueSuggestions
  }
  
  // Generate suggestion from context
  const generateSuggestionFromContext = (type: string, data: any): Omit<Suggestion, 'id' | 'timestamp' | 'status'> => {
    switch (type) {
      case 'feature':
        return {
          type: 'feature',
          title: data.name || 'New Feature',
          description: data.description || 'Feature discovered from conversation',
          preview: {
            priority: data.priority || 'medium',
            category: data.category || 'Core Features',
            status: data.status || 'discovered'
          }
        }
        
      case 'page':
        return {
          type: 'page',
          title: data.name || 'New Page',
          description: data.description || 'Page discovered from conversation',
          preview: {
            type: data.type || 'page',
            sections: data.sections || []
          }
        }
        
      case 'journey':
        return {
          type: 'journey',
          title: data.name || 'User Journey',
          description: data.description || 'User journey discovered from conversation',
          preview: {
            steps: data.steps || []
          }
        }
        
      case 'mockup':
        return {
          type: 'mockup',
          title: data.name || 'New Mockup',
          description: data.description || 'Visual mockup suggestion',
          preview: {
            type: data.type || 'Page',
            content: data.content || ''
          }
        }
        
      default:
        throw new Error(`Unknown suggestion type: ${type}`)
    }
  }
  
  return {
    suggestions: readonly(suggestions),
    pendingSuggestions,
    acceptedSuggestions,
    hasPendingSuggestions,
    addSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    modifySuggestion,
    clearSuggestions,
    clearRejected,
    parseAISuggestions,
    generateSuggestionFromContext
  }
}