export interface Database {
  projects: {
    Row: {
      id: string
      user_id: string
      name: string
      description: string | null
      vision: any
      target_audience: string | null
      differentiators: string[]
      status: 'active' | 'archived' | 'deleted'
      metadata: any
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id?: string
      name: string
      description?: string | null
      vision?: any
      target_audience?: string | null
      differentiators?: string[]
      status?: 'active' | 'archived' | 'deleted'
      metadata?: any
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      name?: string
      description?: string | null
      vision?: any
      target_audience?: string | null
      differentiators?: string[]
      status?: 'active' | 'archived' | 'deleted'
      metadata?: any
      created_at?: string
      updated_at?: string
    }
  }
  
  conversations: {
    Row: {
      id: string
      project_id: string
      user_id: string
      messages: any[]
      context: any
      total_tokens: number
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      project_id: string
      user_id?: string
      messages?: any[]
      context?: any
      total_tokens?: number
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      user_id?: string
      messages?: any[]
      context?: any
      total_tokens?: number
      created_at?: string
      updated_at?: string
    }
  }
  
  features: {
    Row: {
      id: string
      project_id: string
      name: string
      description: string | null
      priority: 'low' | 'medium' | 'high' | 'critical'
      status: 'discovered' | 'defined' | 'approved' | 'implemented'
      category: string | null
      technical_requirements: any
      user_stories: any[]
      acceptance_criteria: string[]
      effort_estimate: number | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      project_id: string
      name: string
      description?: string | null
      priority?: 'low' | 'medium' | 'high' | 'critical'
      status?: 'discovered' | 'defined' | 'approved' | 'implemented'
      category?: string | null
      technical_requirements?: any
      user_stories?: any[]
      acceptance_criteria?: string[]
      effort_estimate?: number | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      name?: string
      description?: string | null
      priority?: 'low' | 'medium' | 'high' | 'critical'
      status?: 'discovered' | 'defined' | 'approved' | 'implemented'
      category?: string | null
      technical_requirements?: any
      user_stories?: any[]
      acceptance_criteria?: string[]
      effort_estimate?: number | null
      created_at?: string
      updated_at?: string
    }
  }
  
  pages: {
    Row: {
      id: string
      project_id: string
      name: string
      description: string | null
      type: 'public' | 'auth' | 'admin' | 'landing' | 'dashboard'
      route: string | null
      components: any
      navigation: any
      seo_metadata: any
      permissions: any
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      project_id: string
      name: string
      description?: string | null
      type?: 'public' | 'auth' | 'admin' | 'landing' | 'dashboard'
      route?: string | null
      components?: any
      navigation?: any
      seo_metadata?: any
      permissions?: any
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      name?: string
      description?: string | null
      type?: 'public' | 'auth' | 'admin' | 'landing' | 'dashboard'
      route?: string | null
      components?: any
      navigation?: any
      seo_metadata?: any
      permissions?: any
      created_at?: string
      updated_at?: string
    }
  }
  
  user_journeys: {
    Row: {
      id: string
      project_id: string
      name: string
      description: string | null
      persona: string | null
      goals: string[]
      steps: any[]
      touchpoints: string[]
      pain_points: any[]
      opportunities: any[]
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      project_id: string
      name: string
      description?: string | null
      persona?: string | null
      goals?: string[]
      steps?: any[]
      touchpoints?: string[]
      pain_points?: any[]
      opportunities?: any[]
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      name?: string
      description?: string | null
      persona?: string | null
      goals?: string[]
      steps?: any[]
      touchpoints?: string[]
      pain_points?: any[]
      opportunities?: any[]
      created_at?: string
      updated_at?: string
    }
  }
  
  mockups: {
    Row: {
      id: string
      project_id: string
      page_id: string | null
      name: string
      type: 'wireframe' | 'highfidelity' | 'prototype' | 'Page' | 'Component' | 'Flow'
      content: any
      html: string | null
      screenshot_url: string | null
      annotations: any[]
      version: number
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      project_id: string
      page_id?: string | null
      name: string
      type?: 'wireframe' | 'highfidelity' | 'prototype' | 'Page' | 'Component' | 'Flow'
      content?: any
      html?: string | null
      screenshot_url?: string | null
      annotations?: any[]
      version?: number
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      project_id?: string
      page_id?: string | null
      name?: string
      type?: 'wireframe' | 'highfidelity' | 'prototype' | 'Page' | 'Component' | 'Flow'
      content?: any
      html?: string | null
      screenshot_url?: string | null
      annotations?: any[]
      version?: number
      created_at?: string
      updated_at?: string
    }
  }
  
  project_collaborators: {
    Row: {
      id: string
      project_id: string
      user_id: string
      role: string
      permissions: any
      invited_at: string
      accepted_at: string | null
    }
    Insert: {
      id?: string
      project_id: string
      user_id: string
      role?: string
      permissions?: any
      invited_at?: string
      accepted_at?: string | null
    }
    Update: {
      id?: string
      project_id?: string
      user_id?: string
      role?: string
      permissions?: any
      invited_at?: string
      accepted_at?: string | null
    }
  }
  
  usage_tracking: {
    Row: {
      id: string
      user_id: string
      project_id: string | null
      action_type: string
      tokens_used: number
      metadata: any
      created_at: string
    }
    Insert: {
      id?: string
      user_id?: string
      project_id?: string | null
      action_type: string
      tokens_used?: number
      metadata?: any
      created_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      project_id?: string | null
      action_type?: string
      tokens_used?: number
      metadata?: any
      created_at?: string
    }
  }
}