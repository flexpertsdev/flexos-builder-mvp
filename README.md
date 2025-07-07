# FlexOS Builder MVP

Transform your app ideas into comprehensive documentation through natural conversation. FlexOS Builder helps non-technical founders articulate their vision with AI-guided discovery.

🚀 **Live Demo**: [Deploy with Netlify below]

## 🎯 Overview

FlexOS Builder is a conversational AI tool that transforms confused app ideas into complete documentation in under 2 hours. Through natural dialogue, visual mockups, and structured specifications, it helps founders communicate their vision clearly to developers.

### Key Features

- 💬 **WhatsApp-style Chat Interface** - Natural conversation with AI
- 📝 **Two-Panel Builder** - Chat on left, content tabs on right
- 🎨 **Dark Theme UI** - Professional, distraction-free interface
- 🎯 **Focus Mode** - Full-screen conversation for deep discovery
- 📊 **Progress Tracking** - Visual indicators of documentation completion
- 🔒 **Authentication** - Supabase auth with social logins (OAuth)
- 💾 **Database Integration** - Persistent storage with Supabase
- 🤖 **AI Integration Ready** - OpenAI/Anthropic API support

## 🚀 Quick Start

### Development (Demo Mode)

```bash
# Install dependencies
npm install

# Start development server (works without configuration)
npm run dev
```

Visit `http://localhost:3000`

### Production Setup

1. **Configure Supabase** (Optional but recommended):
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   # Get them from https://app.supabase.com
   ```

2. **Set up Database**:
   - Create a Supabase project
   - Run `supabase/schema.sql` in SQL Editor
   - Enable OAuth providers (Google, GitHub)

3. **Configure AI** (Optional):
   - Add OpenAI or Anthropic API key to .env
   - AI features will activate automatically

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Deploy to Netlify (Recommended)

1. **Via Netlify UI**:
   - Fork this repository
   - Connect to Netlify
   - Deploy with default settings

2. **Via Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build the project
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod --dir=.output/public
   ```

3. **One-Click Deploy**:
   
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/flexpertsdev/flexos-builder-mvp)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🏗️ Tech Stack

- **Framework**: Nuxt 3
- **Styling**: Tailwind CSS
- **Font**: Inter
- **Auth**: Mock auth with localStorage (Supabase ready)
- **State**: Vue reactivity (no Pinia for MVP)
- **AI**: Mock responses (ready for OpenAI/Anthropic integration)

## 📁 Project Structure

```
flexos-builder/
├── pages/              # Route pages
│   ├── index.vue      # Landing page
│   ├── login.vue      # Authentication
│   ├── dashboard.vue  # Projects dashboard
│   └── project/       # Main builder interface
├── components/        # Vue components
│   ├── ChatPanel.vue     # WhatsApp-style chat
│   ├── ContentPanel.vue  # Tabbed content area
│   └── FocusMode.vue     # Distraction-free mode
├── middleware/        # Route protection
└── assets/           # Styles and static assets
```

## 🎨 Design System

The app uses a dark theme optimized for long working sessions:

- **Primary**: `#16C181` (FlexOS Green)
- **Background**: `#0F1419` (Deep dark)
- **Surface**: `#1A1F26` (Elevated elements)
- **Text**: `#F7F9FA` (High contrast)
- **Accent**: `#9B5DE5` (Focus mode purple)

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration (Optional - app works without it)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Note**: The app works in demo mode without any configuration!

## 🚦 MVP Features

### Completed
- ✅ Landing page with value proposition
- ✅ Authentication with Supabase (OAuth support)
- ✅ Projects dashboard
- ✅ Two-panel builder interface
- ✅ WhatsApp-style chat
- ✅ Mock AI responses
- ✅ Focus mode
- ✅ Dark theme
- ✅ Tab navigation (Vision, Mockups, Features, Docs)
- ✅ Database integration with Supabase
- ✅ Demo mode (works without configuration)

### In Progress
- 🔄 Real AI integration (OpenAI/Anthropic)
- 🔄 Detail pages (Features, Pages, Journeys)
- 🔄 Mockup editor
- 🔄 Export center

## 🔮 Future Enhancements

- [ ] Document export (PDF, Markdown)
- [ ] Real-time collaboration
- [ ] Template library
- [ ] Mobile responsive design
- [ ] PWA features
- [ ] Usage analytics
- [ ] Subscription management

## 📝 Demo Credentials

The app is in demo mode - use any email/password to login.

## 🤝 Contributing

This is an MVP demonstration. For the full version, please contact the FlexOS team.

## 📄 License

MIT License - feel free to use this as a starting point for your own projects!

---

Built with ❤️ for non-technical founders who have great ideas.