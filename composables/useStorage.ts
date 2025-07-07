// Local storage composable for data persistence
export const useStorage = () => {
  const STORAGE_KEYS = {
    USER: 'flexos_user',
    PROJECTS: 'flexos_projects',
    CURRENT_PROJECT: 'flexos_current_project',
    CONVERSATIONS: 'flexos_conversations',
    FEATURES: 'flexos_features',
    PAGES: 'flexos_pages',
    JOURNEYS: 'flexos_journeys',
    MOCKUPS: 'flexos_mockups'
  }

  // Helper to safely parse JSON
  const safeJsonParse = (value: string | null, fallback: any = null) => {
    if (!value) return fallback
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }

  // User management
  const getUser = () => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(STORAGE_KEYS.USER))
    }
    return null
  }

  const setUser = (user: any) => {
    if (process.client) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    }
  }

  const clearUser = () => {
    if (process.client) {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  // Projects management
  const getProjects = () => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(STORAGE_KEYS.PROJECTS), [])
    }
    return []
  }

  const saveProject = (project: any) => {
    if (process.client) {
      const projects = getProjects()
      const existingIndex = projects.findIndex((p: any) => p.id === project.id)
      
      if (existingIndex >= 0) {
        projects[existingIndex] = { ...projects[existingIndex], ...project, updatedAt: new Date().toISOString() }
      } else {
        projects.push({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      }
      
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    }
  }

  const deleteProject = (projectId: string) => {
    if (process.client) {
      const projects = getProjects().filter((p: any) => p.id !== projectId)
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
      
      // Also clean up related data
      localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS}_${projectId}`)
      localStorage.removeItem(`${STORAGE_KEYS.FEATURES}_${projectId}`)
      localStorage.removeItem(`${STORAGE_KEYS.PAGES}_${projectId}`)
      localStorage.removeItem(`${STORAGE_KEYS.JOURNEYS}_${projectId}`)
      localStorage.removeItem(`${STORAGE_KEYS.MOCKUPS}_${projectId}`)
    }
  }

  // Current project
  const getCurrentProjectId = () => {
    if (process.client) {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT)
    }
    return null
  }

  const setCurrentProjectId = (projectId: string) => {
    if (process.client) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId)
    }
  }

  // Conversations management
  const getConversations = (projectId: string) => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}_${projectId}`), [])
    }
    return []
  }

  const saveConversation = (projectId: string, message: any) => {
    if (process.client) {
      const conversations = getConversations(projectId)
      conversations.push({ ...message, timestamp: new Date().toISOString() })
      localStorage.setItem(`${STORAGE_KEYS.CONVERSATIONS}_${projectId}`, JSON.stringify(conversations))
    }
  }

  const clearConversations = (projectId: string) => {
    if (process.client) {
      localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS}_${projectId}`)
    }
  }

  // Features management
  const getFeatures = (projectId: string) => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(`${STORAGE_KEYS.FEATURES}_${projectId}`), [])
    }
    return []
  }

  const saveFeature = (projectId: string, feature: any) => {
    if (process.client) {
      const features = getFeatures(projectId)
      const existingIndex = features.findIndex((f: any) => f.id === feature.id)
      
      if (existingIndex >= 0) {
        features[existingIndex] = { ...features[existingIndex], ...feature }
      } else {
        features.push(feature)
      }
      
      localStorage.setItem(`${STORAGE_KEYS.FEATURES}_${projectId}`, JSON.stringify(features))
    }
  }

  // Pages management
  const getPages = (projectId: string) => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(`${STORAGE_KEYS.PAGES}_${projectId}`), [])
    }
    return []
  }

  const savePage = (projectId: string, page: any) => {
    if (process.client) {
      const pages = getPages(projectId)
      const existingIndex = pages.findIndex((p: any) => p.id === page.id)
      
      if (existingIndex >= 0) {
        pages[existingIndex] = { ...pages[existingIndex], ...page }
      } else {
        pages.push(page)
      }
      
      localStorage.setItem(`${STORAGE_KEYS.PAGES}_${projectId}`, JSON.stringify(pages))
    }
  }

  // Journeys management
  const getJourneys = (projectId: string) => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(`${STORAGE_KEYS.JOURNEYS}_${projectId}`), [])
    }
    return []
  }

  const saveJourney = (projectId: string, journey: any) => {
    if (process.client) {
      const journeys = getJourneys(projectId)
      const existingIndex = journeys.findIndex((j: any) => j.id === journey.id)
      
      if (existingIndex >= 0) {
        journeys[existingIndex] = { ...journeys[existingIndex], ...journey }
      } else {
        journeys.push(journey)
      }
      
      localStorage.setItem(`${STORAGE_KEYS.JOURNEYS}_${projectId}`, JSON.stringify(journeys))
    }
  }

  // Mockups management
  const getMockups = (projectId: string) => {
    if (process.client) {
      return safeJsonParse(localStorage.getItem(`${STORAGE_KEYS.MOCKUPS}_${projectId}`), [])
    }
    return []
  }

  const saveMockup = (projectId: string, mockup: any) => {
    if (process.client) {
      const mockups = getMockups(projectId)
      const existingIndex = mockups.findIndex((m: any) => m.id === mockup.id)
      
      if (existingIndex >= 0) {
        mockups[existingIndex] = { 
          ...mockups[existingIndex], 
          ...mockup,
          updatedAt: new Date().toISOString()
        }
      } else {
        mockups.push({
          ...mockup,
          createdAt: mockup.createdAt || new Date().toISOString(),
          updatedAt: mockup.updatedAt || new Date().toISOString()
        })
      }
      
      localStorage.setItem(`${STORAGE_KEYS.MOCKUPS}_${projectId}`, JSON.stringify(mockups))
    }
  }

  // Clear all data
  const clearAllData = () => {
    if (process.client) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      // Also clear project-specific data
      const projects = getProjects()
      projects.forEach((project: any) => {
        localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS}_${project.id}`)
        localStorage.removeItem(`${STORAGE_KEYS.FEATURES}_${project.id}`)
        localStorage.removeItem(`${STORAGE_KEYS.PAGES}_${project.id}`)
        localStorage.removeItem(`${STORAGE_KEYS.JOURNEYS}_${project.id}`)
        localStorage.removeItem(`${STORAGE_KEYS.MOCKUPS}_${project.id}`)
      })
    }
  }

  return {
    // User
    getUser,
    setUser,
    clearUser,
    // Projects
    getProjects,
    saveProject,
    deleteProject,
    getCurrentProjectId,
    setCurrentProjectId,
    // Conversations
    getConversations,
    saveConversation,
    clearConversations,
    // Features
    getFeatures,
    saveFeature,
    // Pages
    getPages,
    savePage,
    // Journeys
    getJourneys,
    saveJourney,
    // Mockups
    getMockups,
    saveMockup,
    // Utility
    clearAllData
  }
}