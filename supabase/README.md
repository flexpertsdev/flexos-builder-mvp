# Supabase Database Setup

This directory contains the database schema for FlexOS Builder.

## Quick Setup

1. Create a new Supabase project at https://app.supabase.com

2. Copy your project URL and keys to `.env`:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. Run the schema in Supabase SQL Editor:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Create a new query
   - Copy the contents of `schema.sql`
   - Run the query

4. Enable Row Level Security (RLS):
   - The schema includes RLS policies
   - Make sure RLS is enabled on all tables
   - Users can only access their own data

## Database Structure

- **projects**: Main projects table
- **conversations**: AI chat conversations
- **features**: Discovered and defined features
- **pages**: App pages and routes
- **user_journeys**: User flow definitions
- **mockups**: Visual mockups and wireframes
- **project_collaborators**: Team collaboration
- **usage_tracking**: API usage monitoring

## OAuth Setup (Optional)

To enable social logins:

1. Go to Authentication > Providers in Supabase
2. Enable Google:
   - Create OAuth app in Google Console
   - Add redirect URL: `https://yourproject.supabase.co/auth/v1/callback`
3. Enable GitHub:
   - Create OAuth app in GitHub Settings
   - Add redirect URL: `https://yourproject.supabase.co/auth/v1/callback`

## Demo Mode

The app works without Supabase configuration:
- Uses localStorage for data persistence
- No authentication required
- Perfect for testing and development