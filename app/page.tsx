import ChatWidget from '@/components/ChatWidget'
import DemoSection from '@/components/DemoSection'
import IntegrationGuide from '@/components/IntegrationGuide'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Chat Support Widget
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Embed intelligent AI-powered customer support into any website. 
            Built with Cosmic AI streaming for real-time responses.
          </p>
        </div>

        {/* Demo Section */}
        <DemoSection />

        {/* Integration Guide */}
        <IntegrationGuide />

        {/* Features */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Responses</h3>
              <p className="text-gray-600">
                Intelligent conversations using Cosmic's advanced AI capabilities with context awareness.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Streaming</h3>
              <p className="text-gray-600">
                See responses as they're being generated with smooth streaming animations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">📁</div>
              <h3 className="text-xl font-semibold mb-2">File Analysis</h3>
              <p className="text-gray-600">
                Upload and analyze documents, images, PDFs, and spreadsheets.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Customizable Design</h3>
              <p className="text-gray-600">
                Match your brand with custom colors, positioning, and styling options.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Responsive</h3>
              <p className="text-gray-600">
                Perfect experience on desktop, tablet, and mobile devices.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-500 text-2xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-600">
                Built-in security features, rate limiting, and optimized performance.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Chat Widget - positioned fixed */}
      <ChatWidget
        position="bottom-right"
        primaryColor="#3B82F6"
        greeting="Hi! I'm an AI assistant. How can I help you today?"
        title="AI Support"
        allowFileUpload={true}
      />
    </main>
  )
}