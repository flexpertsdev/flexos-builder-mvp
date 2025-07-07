# FlexOS Builder Deployment Guide

## Deployment Options

### Option 1: Demo Mode (Recommended for Testing)

The easiest way to deploy is in **Demo Mode**, which requires NO configuration:

1. **Deploy to Netlify**:
   - Push your code to GitHub
   - Connect repository to Netlify
   - Deploy with default settings
   - ✅ App works immediately!

2. **Demo Mode Features**:
   - ✅ Sign up/login with any email/password
   - ✅ All features work with mock AI responses
   - ✅ Data stored in browser localStorage
   - ⚠️ Data not synced across devices

### Option 2: Full Production Mode

For persistent data and real AI features:

## Step 1: Set Up Supabase (Optional)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Get Credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon key

3. **Disable Email Confirmation** (for testing):
   - Go to Authentication → Providers → Email
   - Turn OFF "Confirm email"

## Step 2: Configure Netlify Environment Variables

1. **Go to Netlify Dashboard**:
   - Navigate to Site Settings → Environment Variables

2. **Add Required Variables**:

   ```env
   # Supabase (optional - for persistent auth)
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   
   # AI Configuration (optional - for real AI responses)
   OPENAI_API_KEY=your_openai_key
   # OR
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

3. **Important Security Notes**:
   - ⚠️ NEVER commit API keys to git
   - ⚠️ Always use environment variables
   - ✅ Netlify encrypts these values

## Step 3: Deploy

1. **Trigger Deployment**:
   - Push any commit to trigger auto-deploy
   - OR manually deploy in Netlify dashboard

2. **Verify Deployment**:
   - Check build logs for any errors
   - Visit your site URL
   - Demo mode banner should NOT appear if configured

## Troubleshooting

### Build Fails with "Secrets detected"

This means API keys were found in the build output:

1. **Never commit .env files**
2. **Use Netlify environment variables**
3. **Check that .env is in .gitignore**

### Login Not Working

If using Supabase:
1. **Check credentials are correct**
2. **Verify email confirmation is disabled**
3. **Check Supabase dashboard for user**

If demo mode:
1. **Clear browser cache/localStorage**
2. **Try incognito window**

### Environment Variables Not Working

1. **Redeploy after adding variables**
2. **Check variable names match exactly**
3. **No quotes needed in Netlify UI**

## Quick Deployment Checklist

- [ ] .env file is NOT in git repository
- [ ] .gitignore includes .env
- [ ] Environment variables set in Netlify
- [ ] Supabase project created (if using)
- [ ] Email confirmation disabled (if using Supabase)
- [ ] AI API key added (if using real AI)

## Demo vs Production

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| Setup Time | 0 minutes | 10-15 minutes |
| Authentication | Local only | Cross-device |
| AI Responses | Mock data | Real AI |
| Data Persistence | Browser only | Database |
| Cost | Free | Supabase + AI costs |

## Recommended Approach

1. **Start with Demo Mode** - Deploy immediately
2. **Test all features** - Ensure everything works
3. **Add Supabase** - When ready for real users
4. **Add AI keys** - When ready for production

## Security Best Practices

1. **API Keys**:
   - Store in Netlify environment variables
   - Never commit to repository
   - Rotate keys regularly

2. **Supabase**:
   - Use Row Level Security (RLS)
   - Keep service key secret
   - Monitor usage

3. **General**:
   - Enable 2FA on all accounts
   - Review Netlify audit logs
   - Monitor for unusual activity