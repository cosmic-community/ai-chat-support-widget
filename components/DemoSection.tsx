export default function DemoSection() {
  return (
    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Try the Chat Widget
      </h2>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg font-semibold mb-4">Interactive Demo</h3>
            <p className="text-gray-600 mb-6">
              The chat widget is active on this page! Click the blue chat button in the 
              bottom-right corner to start a conversation with the AI assistant.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Real-time AI streaming responses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>File upload and analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Persistent conversation history</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Mobile-responsive design</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-3">Try these sample questions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="bg-white p-3 rounded border-l-4 border-primary-500">
                "How does this chat widget work?"
              </li>
              <li className="bg-white p-3 rounded border-l-4 border-primary-500">
                "Can you analyze uploaded documents?"
              </li>
              <li className="bg-white p-3 rounded border-l-4 border-primary-500">
                "What features does this widget offer?"
              </li>
              <li className="bg-white p-3 rounded border-l-4 border-primary-500">
                "How can I customize the appearance?"
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}