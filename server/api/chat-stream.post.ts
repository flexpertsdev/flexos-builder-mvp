import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, projectContext, activeTab, mode } = body
  
  // Get runtime config - access at runtime only
  const config = useRuntimeConfig(event)
  const openaiKey = process.env.OPENAI_API_KEY || config.openaiApiKey || ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY || config.anthropicApiKey || ''
  
  // Set up SSE headers
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  
  // Check if in demo mode (forced by user or no API keys)
  const isDemoMode = mode === 'demo' || (!openaiKey && !anthropicKey)
  
  if (isDemoMode) {
    // Stream mock response with structured format
    await streamMockResponse(event, messages, activeTab, projectContext)
    return
  }
  
  try {
    // Use Anthropic if available, otherwise OpenAI
    if (anthropicKey) {
      await streamAnthropicChat(event, anthropicKey, messages, projectContext, activeTab)
    } else {
      await streamOpenAIChat(event, openaiKey, messages, projectContext, activeTab)
    }
  } catch (error) {
    console.error('AI Stream Error:', error)
    await sendError(event, 'Failed to process message. Please try again.')
  }
})

async function streamOpenAIChat(event: any, apiKey: string, messages: any[], projectContext: any, activeTab: string) {
  const openai = new OpenAI({ apiKey })
  
  const systemPrompt = buildSystemPrompt(activeTab, projectContext)
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 4096,
    stream: true,
    response_format: { type: "json_object" }
  })
  
  // Collect the full response
  let fullResponse = ''
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      fullResponse += content
    }
  }
  
  try {
    // Parse the JSON response
    const parsed = JSON.parse(fullResponse)
    
    // Stream the message content
    const messageWords = parsed.message.split(' ')
    for (const word of messageWords) {
      event.node.res.write(`data: ${JSON.stringify({ content: word + ' ' })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Send suggestions as separate events
    if (parsed.suggestions && parsed.suggestions.length > 0) {
      for (const suggestion of parsed.suggestions) {
        event.node.res.write(`event: suggestion\ndata: ${JSON.stringify(suggestion)}\n\n`)
      }
    }
    
    // Send actions as separate events
    if (parsed.actions && parsed.actions.length > 0) {
      for (const action of parsed.actions) {
        event.node.res.write(`event: action\ndata: ${JSON.stringify(action)}\n\n`)
      }
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    // Fallback: stream as plain text
    event.node.res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`)
  }
  
  event.node.res.write('data: [DONE]\n\n')
  event.node.res.end()
}

async function streamAnthropicChat(event: any, apiKey: string, messages: any[], projectContext: any, activeTab: string) {
  const anthropic = new Anthropic({ apiKey })
  
  const systemPrompt = buildSystemPrompt(activeTab, projectContext)
  
  const anthropicMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }))
  
  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt,
    messages: anthropicMessages,
    stream: true
  })
  
  // Collect the full response
  let fullResponse = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      const content = chunk.delta.text
      if (content) {
        fullResponse += content
      }
    }
  }
  
  try {
    // Parse the JSON response
    const parsed = JSON.parse(fullResponse)
    
    // Stream the message content
    const messageWords = parsed.message.split(' ')
    for (const word of messageWords) {
      event.node.res.write(`data: ${JSON.stringify({ content: word + ' ' })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Send suggestions as separate events
    if (parsed.suggestions && parsed.suggestions.length > 0) {
      for (const suggestion of parsed.suggestions) {
        event.node.res.write(`event: suggestion\ndata: ${JSON.stringify(suggestion)}\n\n`)
      }
    }
    
    // Send actions as separate events
    if (parsed.actions && parsed.actions.length > 0) {
      for (const action of parsed.actions) {
        event.node.res.write(`event: action\ndata: ${JSON.stringify(action)}\n\n`)
      }
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    // Fallback: stream as plain text
    event.node.res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`)
  }
  
  event.node.res.write('data: [DONE]\n\n')
  event.node.res.end()
}

async function streamMockResponse(event: any, messages: any[], activeTab: string, projectContext: any) {
  const response = getMockResponse(messages, activeTab, projectContext)
  
  try {
    // Parse the structured response
    const parsed = typeof response === 'string' ? JSON.parse(response) : response
    
    // Stream the message content
    const words = parsed.message.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
      event.node.res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Send suggestions as separate events
    if (parsed.suggestions && parsed.suggestions.length > 0) {
      for (const suggestion of parsed.suggestions) {
        event.node.res.write(`event: suggestion\ndata: ${JSON.stringify(suggestion)}\n\n`)
      }
    }
    
    // Send actions as separate events
    if (parsed.actions && parsed.actions.length > 0) {
      for (const action of parsed.actions) {
        event.node.res.write(`event: action\ndata: ${JSON.stringify(action)}\n\n`)
      }
    }
  } catch (error) {
    console.error('Failed to parse mock response:', error)
    // Fallback for old-style responses
    const words = response.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
      event.node.res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  event.node.res.write('data: [DONE]\n\n')
  event.node.res.end()
}

function sendError(event: any, error: string) {
  event.node.res.write(`data: ${JSON.stringify({ error })}\n\n`)
  event.node.res.end()
}

function buildSystemPrompt(activeTab: string, projectContext: any) {
  const basePrompt = `You are FlexOS Builder, an AI assistant helping non-technical founders transform their app ideas into comprehensive documentation. 

CRITICAL INSTRUCTIONS FOR STRUCTURED RESPONSES:
You MUST respond with a JSON object containing:
1. "message": Your conversational response (2-3 sentences max, ONE question only)
2. "suggestions": Array of items to suggest (features, pages, journeys, mockups)
3. "actions": Array of actions to take (update vision, create mockup, etc.)

EXAMPLE RESPONSE FORMAT:
{
  "message": "That's interesting! Tell me more about who your target users are.",
  "suggestions": [
    {
      "type": "feature",
      "data": {
        "name": "User Authentication",
        "description": "Secure login and registration system",
        "priority": "high",
        "category": "Security"
      }
    },
    {
      "type": "page",
      "data": {
        "name": "Dashboard",
        "description": "Main user dashboard after login",
        "type": "auth",
        "sections": ["Overview", "Recent Activity", "Quick Actions"]
      }
    }
  ],
  "actions": [
    {
      "type": "update_vision",
      "data": {
        "vision": "Create a platform that connects users efficiently"
      }
    }
  ]
}

SUGGESTION TYPES:
- feature: { name, description, priority, category }
- page: { name, description, type, sections }
- journey: { name, description, steps: [{title, description}] }
- mockup: { name, description, type, content }

ACTION TYPES:
- update_vision: { vision }
- update_description: { description }
- update_target_audience: { targetAudience }
- create_mockup: { name, description, type, content }

RULES:
1. ALWAYS return valid JSON
2. Ask ONLY ONE focused question in the message
3. Keep message concise (2-3 sentences max)
4. Only include suggestions when you have enough context
5. Make suggestions specific and actionable

Current project context:
- Name: ${projectContext.name || 'Untitled Project'}
- Description: ${projectContext.description || 'No description yet'}
- Target Audience: ${projectContext.targetAudience || 'Not defined'}
- Vision: ${projectContext.vision || 'Not defined'}
- Existing Features: ${projectContext.features?.length || 0}
- Existing Pages: ${projectContext.pages?.length || 0}
- Message Context: ${JSON.stringify(projectContext.messageContext || [])}`

  const tabPrompts = {
    vision: `
You are helping define the project vision. Ask ONE specific question about:
- The core problem being solved
- Who the target users are
- What makes this solution unique
- The desired outcome for users`,
    
    mockups: `
You are discussing UI design and creating HTML mockups. Ask ONE specific question about:
- The main user interface
- Key screens needed
- Visual style preferences
- User flow through the app

When creating mockups, generate COMPLETE self-contained HTML pages with:
1. All CSS inline in <style> tags
2. All JavaScript inline in <script> tags
3. Responsive design using modern CSS (flexbox, grid)
4. Professional UI with proper spacing, colors, and typography
5. Semantic HTML with data-component attributes for future Vue conversion
6. Interactive elements where appropriate (hover states, click handlers)
7. Mobile-first design that works on all devices

Example mockup structure:
{
  "type": "mockup",
  "data": {
    "name": "Dashboard Page",
    "description": "Main dashboard showing user overview",
    "type": "Page",
    "content": "<!DOCTYPE html><html>...</html>"
  }
}`,
    
    features: `
You are discovering features. Ask ONE specific question about:
- Essential functionality needed
- User actions and workflows
- Data requirements
- Integration needs`,
    
    docs: `
You are reviewing documentation. Ask ONE specific question about:
- Missing information
- Technical specifications
- Implementation details
- Edge cases to consider`
  }
  
  return basePrompt + (tabPrompts[activeTab] || tabPrompts.vision)
}

function getMockResponse(messages: any[], activeTab: string, projectContext: any) {
  const userMessageCount = messages.filter(m => m.role === 'user').length
  
  // Structured mock responses
  const mockResponses = {
    vision: [
      {
        message: "What specific problem are you trying to solve for your users?",
        suggestions: [],
        actions: []
      },
      {
        message: "Who exactly would use this app - can you describe your ideal user?",
        suggestions: [],
        actions: userMessageCount > 3 ? [{
          type: "update_target_audience",
          data: { targetAudience: "Small business owners and entrepreneurs" }
        }] : []
      },
      {
        message: "What makes your solution different from what's already out there?",
        suggestions: [{
          type: "feature",
          data: {
            name: "AI-Powered Insights",
            description: "Use artificial intelligence to provide smart recommendations",
            priority: "high",
            category: "Core Features"
          }
        }],
        actions: []
      }
    ],
    mockups: [
      {
        message: "What's the first thing users should see when they open your app?",
        suggestions: [{
          type: "page",
          data: {
            name: "Welcome Screen",
            description: "First screen users see with branding and call-to-action",
            type: "public",
            sections: ["Hero Image", "Value Proposition", "Get Started Button"]
          }
        }],
        actions: []
      },
      {
        message: "Do you prefer a clean minimal design or something more colorful and playful?",
        suggestions: [],
        actions: [{
          type: "create_mockup",
          data: {
            name: "Dashboard Mockup",
            description: "Visual representation of the main dashboard",
            type: "Page",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Your App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
            line-height: 1.6;
        }
        
        /* Header */
        .header {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 1rem;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4299e1;
        }
        
        .user-menu {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #4299e1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        /* Main Content */
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card h3 {
            font-size: 1.1rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
        }
        
        .metric {
            font-size: 2rem;
            font-weight: bold;
            color: #2d3748;
            margin: 0.5rem 0;
        }
        
        .trend {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .trend.positive {
            color: #48bb78;
            background: #f0fff4;
        }
        
        .trend.negative {
            color: #f56565;
            background: #fff5f5;
        }
        
        /* Activity List */
        .activity-section {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .activity-item {
            display: flex;
            align-items: start;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #edf2f7;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .activity-content {
            flex: 1;
        }
        
        .activity-time {
            font-size: 0.875rem;
            color: #718096;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .header-content {
                padding: 0 0.5rem;
            }
            
            .metric {
                font-size: 1.5rem;
            }
        }
        
        /* Interactive Elements */
        button {
            background: #4299e1;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background 0.2s;
        }
        
        button:hover {
            background: #3182ce;
        }
        
        /* Vue conversion hints */
        [data-component="dashboard-card"] {
            /* Component boundary for Vue conversion */
        }
        
        [data-component="activity-list"] {
            /* Component boundary for Vue conversion */
        }
    </style>
</head>
<body>
    <header class="header" data-component="app-header">
        <div class="header-content">
            <h1 class="logo">Your App</h1>
            <div class="user-menu">
                <button>New Project</button>
                <div class="avatar">JD</div>
            </div>
        </div>
    </header>
    
    <main class="container">
        <h2 style="margin-bottom: 1.5rem; color: #2d3748;">Dashboard Overview</h2>
        
        <div class="dashboard-grid">
            <div class="card" data-component="dashboard-card">
                <h3>Total Projects</h3>
                <div class="metric">24</div>
                <span class="trend positive">↑ 12% from last month</span>
            </div>
            
            <div class="card" data-component="dashboard-card">
                <h3>Active Users</h3>
                <div class="metric">1,234</div>
                <span class="trend positive">↑ 8% from last week</span>
            </div>
            
            <div class="card" data-component="dashboard-card">
                <h3>Revenue</h3>
                <div class="metric">$12,345</div>
                <span class="trend negative">↓ 3% from last month</span>
            </div>
        </div>
        
        <div class="activity-section" data-component="activity-list">
            <h3 style="margin-bottom: 1rem;">Recent Activity</h3>
            
            <div class="activity-item">
                <div class="activity-icon">📊</div>
                <div class="activity-content">
                    <strong>New report generated</strong>
                    <p style="color: #718096; font-size: 0.875rem;">Monthly analytics report is ready</p>
                    <span class="activity-time">2 hours ago</span>
                </div>
            </div>
            
            <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                    <strong>New user registered</strong>
                    <p style="color: #718096; font-size: 0.875rem;">Sarah Johnson joined the platform</p>
                    <span class="activity-time">5 hours ago</span>
                </div>
            </div>
            
            <div class="activity-item">
                <div class="activity-icon">🚀</div>
                <div class="activity-content">
                    <strong>Project launched</strong>
                    <p style="color: #718096; font-size: 0.875rem;">E-commerce redesign is now live</p>
                    <span class="activity-time">1 day ago</span>
                </div>
            </div>
        </div>
    </main>
    
    <script>
        // Add interactivity
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                console.log('Card clicked:', this.querySelector('h3').textContent);
                // In Vue, this would emit an event or navigate
            });
        });
        
        // Simulate real-time updates
        setTimeout(() => {
            const metrics = document.querySelectorAll('.metric');
            metrics.forEach(metric => {
                const current = parseInt(metric.textContent.replace(/[^0-9]/g, ''));
                const isRevenue = metric.textContent.includes('$');
                const newValue = current + Math.floor(Math.random() * 10);
                metric.textContent = isRevenue ? '$' + newValue.toLocaleString() : newValue.toString();
            });
        }, 5000);
    </script>
</body>
</html>`
          }
        }]
      }
    ],
    features: [
      {
        message: "What's the one feature users absolutely can't live without?",
        suggestions: [{
          type: "feature",
          data: {
            name: "User Authentication",
            description: "Secure login and registration system",
            priority: "high",
            category: "Security"
          }
        }],
        actions: []
      },
      {
        message: "How will users find what they're looking for?",
        suggestions: [{
          type: "feature",
          data: {
            name: "Advanced Search",
            description: "Search functionality with filters and sorting",
            priority: "medium",
            category: "Discovery"
          }
        }],
        actions: []
      }
    ],
    docs: [
      {
        message: "Have we covered all the user types who will use your app?",
        suggestions: [{
          type: "journey",
          data: {
            name: "New User Onboarding",
            description: "Step-by-step journey for first-time users",
            steps: [
              { title: "Sign Up", description: "User creates an account" },
              { title: "Welcome Tour", description: "Guided tour of key features" },
              { title: "First Action", description: "User completes their first task" }
            ]
          }
        }],
        actions: []
      }
    ]
  }
  
  // Initial responses
  if (userMessageCount === 0) {
    return {
      message: "Hi! I'm here to help transform your app idea into comprehensive documentation. What kind of app would you like to build?",
      suggestions: [],
      actions: []
    }
  }
  
  if (userMessageCount === 1) {
    return {
      message: "That sounds interesting! Tell me more about the main problem your app will solve.",
      suggestions: [],
      actions: [{
        type: "update_vision",
        data: { vision: "Build an innovative solution that transforms how people work" }
      }]
    }
  }
  
  // Tab-specific responses
  const responses = mockResponses[activeTab] || mockResponses.vision
  const response = responses[(userMessageCount - 2) % responses.length]
  
  // Add context-aware suggestions based on project state
  if (projectContext.features?.length === 0 && userMessageCount > 3) {
    response.suggestions.push({
      type: "feature",
      data: {
        name: "Dashboard",
        description: "Central hub for users to see overview and metrics",
        priority: "high",
        category: "Core Features"
      }
    })
  }
  
  return response
}