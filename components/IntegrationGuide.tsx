'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function IntegrationGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const embedCode = `<script src="https://your-domain.com/widget.js"></script>
<script>
  CosmicChatWidget.init({
    bucketSlug: 'your-bucket-slug',
    apiKey: 'your-api-key',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    greeting: 'Hello! How can I help you today?'
  })
</script>`

  const reactCode = `import ChatWidget from '@/components/ChatWidget'

function App() {
  return (
    <div>
      <ChatWidget
        position="bottom-right"
        primaryColor="#3B82F6"
        greeting="Hello! How can I help you today?"
        title="AI Support"
        allowFileUpload={true}
      />
    </div>
  )
}`

  const nextjsCode = `// pages/_app.js or app/layout.tsx
import ChatWidget from '@/components/ChatWidget'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget
        position="bottom-right"
        primaryColor="#3B82F6"
        greeting="Hi! How can I help you today?"
      />
    </>
  )
}`

  return (
    <section className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Easy Integration
      </h2>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HTML/JavaScript Integration */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">HTML</span>
            Embed in Any Website
          </h3>
          <p className="text-gray-600 mb-4">
            Add the widget to any HTML website with a simple script tag:
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(embedCode, 'embed')}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copiedCode === 'embed' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* React Integration */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">React</span>
            React Component
          </h3>
          <p className="text-gray-600 mb-4">
            Use as a React component in your application:
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{reactCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(reactCode, 'react')}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copiedCode === 'react' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Next.js Integration */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Next.js</span>
            Next.js Integration
          </h3>
          <p className="text-gray-600 mb-4">
            Add to your Next.js app layout for site-wide availability:
          </p>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{nextjsCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(nextjsCode, 'nextjs')}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copiedCode === 'nextjs' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Configuration Options</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Required</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-white px-1 rounded">bucketSlug</code> - Your Cosmic bucket</li>
                <li><code className="bg-white px-1 rounded">apiKey</code> - Cosmic write key</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-white px-1 rounded">position</code> - Widget placement</li>
                <li><code className="bg-white px-1 rounded">primaryColor</code> - Theme color</li>
                <li><code className="bg-white px-1 rounded">greeting</code> - Welcome message</li>
                <li><code className="bg-white px-1 rounded">allowFileUpload</code> - Enable file uploads</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}