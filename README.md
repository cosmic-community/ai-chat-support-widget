# AI Chat Support Widget

![AI Chat Widget](https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&h=300&fit=crop&auto=format)

A modern, AI-powered chat support widget that can be embedded into any website. Built with Next.js and powered by Cosmic's AI streaming capabilities for real-time, intelligent customer support.

## Features

- 🤖 **AI-Powered Responses** - Intelligent chat using Cosmic's AI streaming
- 💬 **Real-time Streaming** - See responses as they're being generated
- 📁 **File Upload Support** - Analyze documents, images, and PDFs
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Customizable** - Easy branding and styling options
- 💾 **Session Memory** - Maintains conversation history
- ⚡ **Fast Integration** - Simple embed code for any website
- 🔒 **Secure** - Built-in rate limiting and content filtering

## Clone this Bucket and Code Repository

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Bucket and Code Repository](https://img.shields.io/badge/Clone%20this%20Bucket-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](http://localhost:3040/projects/new?clone_bucket=68a76ba9ffd08cae13b80316&clone_repository=68a76d88ffd08cae13b8033d)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Create an AI chat support widget that can be added to any site. Use the Cosmic AI streaming for chat

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Cosmic SDK** - AI streaming and content management
- **React Hooks** - State management and effects
- **Lucide Icons** - Modern icon library

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account with AI capabilities enabled
- Cosmic Bucket with write access

### Installation

1. **Clone this repository:**
   ```bash
   git clone <repository-url>
   cd ai-chat-widget
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

4. **Run the development server:**
   ```bash
   bun run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to see the widget in action.

## Cosmic SDK Examples

### Basic AI Chat Implementation

```typescript
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG!,
  readKey: process.env.COSMIC_READ_KEY!,
  writeKey: process.env.COSMIC_WRITE_KEY!
})

// Stream AI responses
const stream = await cosmic.ai.generateText({
  messages: chatHistory,
  max_tokens: 500,
  stream: true
})
```

### File Analysis

```typescript
// Analyze uploaded files
const response = await cosmic.ai.generateText({
  prompt: 'Analyze this document and answer questions about it',
  media_url: fileUrl,
  max_tokens: 800
})
```

## Cosmic CMS Integration

The widget leverages Cosmic's AI capabilities to provide intelligent responses:

- **AI Streaming**: Real-time response generation using `cosmic.ai.generateText()`
- **File Analysis**: Support for analyzing uploaded documents and images
- **Conversation Context**: Maintains chat history for contextual responses
- **Custom Prompts**: Configurable AI behavior and personality

## Widget Integration

### Embed in Any Website

Add this script tag to embed the widget:

```html
<script src="https://your-domain.com/widget.js"></script>
<script>
  CosmicChatWidget.init({
    bucketSlug: 'your-bucket-slug',
    apiKey: 'your-api-key',
    position: 'bottom-right',
    primaryColor: '#3B82F6'
  })
</script>
```

### React Integration

```jsx
import ChatWidget from '@/components/ChatWidget'

function App() {
  return (
    <div>
      <ChatWidget
        position="bottom-right"
        primaryColor="#3B82F6"
        greeting="Hello! How can I help you today?"
      />
    </div>
  )
}
```

## Customization

### Styling Options

- Primary color scheme
- Widget position (bottom-right, bottom-left, etc.)
- Custom greeting messages
- Brand logo and colors
- Animation preferences

### AI Configuration

- Custom system prompts
- Response length limits
- File upload restrictions
- Rate limiting settings

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Netlify
1. Connect repository
2. Set build command: `bun run build`
3. Set publish directory: `out` (for static export)

### Self-Hosted
1. Build the application: `bun run build`
2. Start the server: `bun run start`
3. Configure reverse proxy (nginx/Apache)

---

Built with [Cosmic](https://www.cosmicjs.com) - The headless CMS for modern applications.
<!-- README_END -->