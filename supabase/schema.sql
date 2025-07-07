-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE feature_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE feature_status AS ENUM ('discovered', 'defined', 'approved', 'implemented');
CREATE TYPE page_type AS ENUM ('public', 'auth', 'admin', 'landing', 'dashboard');
CREATE TYPE mockup_type AS ENUM ('wireframe', 'highfidelity', 'prototype');

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    vision JSONB DEFAULT '{}',
    target_audience TEXT,
    differentiators TEXT[] DEFAULT '{}',
    status project_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    messages JSONB[] DEFAULT '{}',
    context JSONB DEFAULT '{}',
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    priority feature_priority DEFAULT 'medium',
    status feature_status DEFAULT 'discovered',
    category TEXT,
    technical_requirements JSONB DEFAULT '{}',
    user_stories JSONB[] DEFAULT '{}',
    acceptance_criteria TEXT[] DEFAULT '{}',
    effort_estimate INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type page_type DEFAULT 'public',
    route TEXT,
    components JSONB DEFAULT '{}',
    navigation JSONB DEFAULT '{}',
    seo_metadata JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Journeys table
CREATE TABLE user_journeys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    persona TEXT,
    goals TEXT[] DEFAULT '{}',
    steps JSONB[] DEFAULT '{}',
    touchpoints TEXT[] DEFAULT '{}',
    pain_points JSONB[] DEFAULT '{}',
    opportunities JSONB[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mockups table
CREATE TABLE mockups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type mockup_type DEFAULT 'wireframe',
    content JSONB DEFAULT '{}',
    screenshot_url TEXT,
    annotations JSONB[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project collaborators table (for future team features)
CREATE TABLE project_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(project_id, user_id)
);

-- Usage tracking table
CREATE TABLE usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_features_project_id ON features(project_id);
CREATE INDEX idx_features_priority ON features(priority);
CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_journeys_project_id ON user_journeys(project_id);
CREATE INDEX idx_mockups_project_id ON mockups(project_id);
CREATE INDEX idx_mockups_page_id ON mockups(page_id);
CREATE INDEX idx_usage_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_created_at ON usage_tracking(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view conversations for their projects" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = conversations.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations for their projects" ON conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = conversations.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update conversations for their projects" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = conversations.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Similar policies for features, pages, user_journeys, mockups
CREATE POLICY "Users can manage features for their projects" ON features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = features.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage pages for their projects" ON pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage journeys for their projects" ON user_journeys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = user_journeys.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage mockups for their projects" ON mockups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = mockups.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage tracking" ON usage_tracking
    FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_journeys_updated_at BEFORE UPDATE ON user_journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mockups_updated_at BEFORE UPDATE ON mockups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();