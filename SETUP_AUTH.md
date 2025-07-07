# FlexOS Builder Authentication Setup

## Current Status: Demo Mode

The app is currently running in **Demo Mode**, which means:
- ✅ You can sign up/login with any email and password
- ✅ All features work normally
- ⚠️ Data is stored locally in your browser (not synced across devices)
- ⚠️ Data will be lost if you clear browser storage

## To Enable Full Authentication (Optional)

If you want persistent data across devices, follow these steps:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

### 2. Get Your API Keys

1. In your Supabase dashboard, go to Settings → API
2. Copy these values:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - Anon/Public key (a long string starting with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### 5. Enable Email Authentication (Optional)

By default, Supabase requires email confirmation. To disable this for testing:

1. Go to Supabase Dashboard → Authentication → Providers
2. Click on Email
3. Turn OFF "Confirm email"

## Deployment Configuration

For Netlify deployment:

1. Go to your Netlify site settings
2. Navigate to Environment Variables
3. Add the same variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (for AI features)

## Troubleshooting

### "Supabase credentials not configured" warning
This is normal in demo mode. The app works fine without Supabase.

### Can't log in after deployment
Make sure environment variables are set in your deployment platform.

### Lost my demo data
Demo data is stored in browser localStorage. It's not recoverable once cleared.

## Demo Mode Features

Even in demo mode, you get:
- ✅ Full AI conversation capabilities
- ✅ Project creation and management
- ✅ Mockup generation
- ✅ Feature discovery
- ✅ Documentation generation
- ✅ Export functionality

The only limitation is data persistence across devices/browsers.