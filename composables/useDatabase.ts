import type { Database } from '~/types/database'

export const useDatabase = () => {
  const { $supabase } = useNuxtApp()
  const { user } = useSupabase()
  
  // If no Supabase, use local storage fallback
  if (!$supabase) {
    const storage = useStorage()
    return {
      // Projects
      getProjects: async () => ({ data: storage.getProjects(), error: null }),
      getProject: async (id: string) => {
        const projects = storage.getProjects()
        return { data: projects.find(p => p.id === id), error: null }
      },
      createProject: async (project: any) => {
        storage.saveProject(project)
        return { data: project, error: null }
      },
      updateProject: async (id: string, updates: any) => {
        const project = { id, ...updates }
        storage.saveProject(project)
        return { data: project, error: null }
      },
      deleteProject: async (id: string) => {
        storage.deleteProject(id)
        return { data: null, error: null }
      },
      
      // Conversations
      getConversations: async (projectId: string) => ({ 
        data: storage.getConversations(projectId), 
        error: null 
      }),
      createConversation: async (projectId: string, message: any) => {
        storage.saveConversation(projectId, message)
        return { data: message, error: null }
      },
      
      // Features
      getFeatures: async (projectId: string) => ({ 
        data: storage.getFeatures(projectId), 
        error: null 
      }),
      createFeature: async (projectId: string, feature: any) => {
        storage.saveFeature(projectId, feature)
        return { data: feature, error: null }
      },
      updateFeature: async (projectId: string, id: string, updates: any) => {
        const feature = { id, ...updates }
        storage.saveFeature(projectId, feature)
        return { data: feature, error: null }
      },
      
      // Pages
      getPages: async (projectId: string) => ({ 
        data: storage.getPages(projectId), 
        error: null 
      }),
      createPage: async (projectId: string, page: any) => {
        storage.savePage(projectId, page)
        return { data: page, error: null }
      },
      updatePage: async (projectId: string, id: string, updates: any) => {
        const page = { id, ...updates }
        storage.savePage(projectId, page)
        return { data: page, error: null }
      },
      
      // User Journeys
      getJourneys: async (projectId: string) => ({ 
        data: storage.getJourneys(projectId), 
        error: null 
      }),
      createJourney: async (projectId: string, journey: any) => {
        storage.saveJourney(projectId, journey)
        return { data: journey, error: null }
      },
      updateJourney: async (projectId: string, id: string, updates: any) => {
        const journey = { id, ...updates }
        storage.saveJourney(projectId, journey)
        return { data: journey, error: null }
      },
      
      // Mockups
      getMockups: async (projectId: string) => ({ 
        data: storage.getMockups(projectId), 
        error: null 
      }),
      createMockup: async (projectId: string, mockup: any) => {
        storage.saveMockup(projectId, mockup)
        return { data: mockup, error: null }
      },
      updateMockup: async (projectId: string, id: string, updates: any) => {
        const mockup = { id, ...updates }
        storage.saveMockup(projectId, mockup)
        return { data: mockup, error: null }
      }
    }
  }
  
  // Real Supabase implementation
  return {
    // Projects
    async getProjects() {
      const { data, error } = await $supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.value?.id)
        .order('updated_at', { ascending: false })
      
      return { data, error }
    },
    
    async getProject(id: string) {
      const { data, error } = await $supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    },
    
    async createProject(project: Partial<Database['projects']['Insert']>) {
      const { data, error } = await $supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.value?.id
        })
        .select()
        .single()
      
      return { data, error }
    },
    
    async updateProject(id: string, updates: Partial<Database['projects']['Update']>) {
      const { data, error } = await $supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    async deleteProject(id: string) {
      const { error } = await $supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      return { data: null, error }
    },
    
    // Conversations
    async getConversations(projectId: string) {
      const { data, error } = await $supabase
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      
      return { data, error }
    },
    
    async createConversation(conversation: Partial<Database['conversations']['Insert']>) {
      const { data, error } = await $supabase
        .from('conversations')
        .insert({
          ...conversation,
          user_id: user.value?.id
        })
        .select()
        .single()
      
      return { data, error }
    },
    
    async updateConversation(id: string, updates: Partial<Database['conversations']['Update']>) {
      const { data, error } = await $supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    // Features
    async getFeatures(projectId: string) {
      const { data, error } = await $supabase
        .from('features')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false })
      
      return { data, error }
    },
    
    async getFeature(id: string) {
      const { data, error } = await $supabase
        .from('features')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    },
    
    async createFeature(feature: Partial<Database['features']['Insert']>) {
      const { data, error } = await $supabase
        .from('features')
        .insert(feature)
        .select()
        .single()
      
      return { data, error }
    },
    
    async updateFeature(id: string, updates: Partial<Database['features']['Update']>) {
      const { data, error } = await $supabase
        .from('features')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    async deleteFeature(id: string) {
      const { error } = await $supabase
        .from('features')
        .delete()
        .eq('id', id)
      
      return { data: null, error }
    },
    
    // Pages
    async getPages(projectId: string) {
      const { data, error } = await $supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .order('name')
      
      return { data, error }
    },
    
    async getPage(id: string) {
      const { data, error } = await $supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    },
    
    async createPage(page: Partial<Database['pages']['Insert']>) {
      const { data, error } = await $supabase
        .from('pages')
        .insert(page)
        .select()
        .single()
      
      return { data, error }
    },
    
    async updatePage(id: string, updates: Partial<Database['pages']['Update']>) {
      const { data, error } = await $supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    async deletePage(id: string) {
      const { error } = await $supabase
        .from('pages')
        .delete()
        .eq('id', id)
      
      return { data: null, error }
    },
    
    // User Journeys
    async getJourneys(projectId: string) {
      const { data, error } = await $supabase
        .from('user_journeys')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at')
      
      return { data, error }
    },
    
    async getJourney(id: string) {
      const { data, error } = await $supabase
        .from('user_journeys')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    },
    
    async createJourney(journey: Partial<Database['user_journeys']['Insert']>) {
      const { data, error } = await $supabase
        .from('user_journeys')
        .insert(journey)
        .select()
        .single()
      
      return { data, error }
    },
    
    async updateJourney(id: string, updates: Partial<Database['user_journeys']['Update']>) {
      const { data, error } = await $supabase
        .from('user_journeys')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    async deleteJourney(id: string) {
      const { error } = await $supabase
        .from('user_journeys')
        .delete()
        .eq('id', id)
      
      return { data: null, error }
    },
    
    // Mockups
    async getMockups(projectId: string) {
      const { data, error } = await $supabase
        .from('mockups')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      return { data, error }
    },
    
    async getMockup(id: string) {
      const { data, error } = await $supabase
        .from('mockups')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    },
    
    async createMockup(mockup: Partial<Database['mockups']['Insert']>) {
      const { data, error } = await $supabase
        .from('mockups')
        .insert(mockup)
        .select()
        .single()
      
      return { data, error }
    },
    
    async updateMockup(id: string, updates: Partial<Database['mockups']['Update']>) {
      const { data, error } = await $supabase
        .from('mockups')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    },
    
    async deleteMockup(id: string) {
      const { error } = await $supabase
        .from('mockups')
        .delete()
        .eq('id', id)
      
      return { data: null, error }
    },
    
    // Usage tracking
    async trackUsage(action: string, tokens: number = 0, metadata: any = {}) {
      const { error } = await $supabase
        .from('usage_tracking')
        .insert({
          user_id: user.value?.id,
          action_type: action,
          tokens_used: tokens,
          metadata
        })
      
      return { error }
    }
  }
}