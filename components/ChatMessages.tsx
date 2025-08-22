import type { ChatMessage } from '@/types'
import TypingIndicator from '@/components/TypingIndicator'

interface ChatMessagesProps {
  messages: ChatMessage[]
  streamingMessage?: ChatMessage | null
}

export default function ChatMessages({ messages, streamingMessage }: ChatMessagesProps) {
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const formatMessageContent = (content: string) => {
    // Enhanced markdown-like formatting for recipe content
    let formattedContent = content

    // Format recipe sections with better styling
    formattedContent = formattedContent
      // Bold recipe names and section headers
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic for emphasis
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Format ingredient lists
      .replace(/^- (.*$)/gim, '<div class="ml-4 mb-1">• $1</div>')
      // Format numbered steps
      .replace(/^(\d+)\. (.*$)/gim, '<div class="mb-2"><span class="font-semibold text-blue-600">$1.</span> $2</div>')
      // Format recipe metadata (time, servings, etc.)
      .replace(/(\d+)\s*(minutes?|mins?|hours?|hrs?|servings?)/gi, '<span class="inline-block bg-gray-100 px-2 py-1 rounded text-sm">$1 $2</span>')
      // Format ratings
      .replace(/(\d+\/5)\s*stars?/gi, '<span class="text-yellow-500 font-medium">⭐ $1</span>')

    // Split by newlines and process each line
    const lines = formattedContent.split('\n')
    
    return lines.map((line, index) => {
      // Check if line contains HTML from our formatting
      if (line.includes('<')) {
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
        )
      }
      
      // Regular line with line breaks
      return (
        <span key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  const getMessageClasses = (role: string) => {
    const baseClasses = "max-w-[85%] rounded-lg px-4 py-3 text-sm break-words transition-all duration-200 ease-in-out"
    
    if (role === 'user') {
      return `${baseClasses} bg-blue-500 text-white ml-auto`
    }
    
    return `${baseClasses} bg-gray-50 text-gray-800 border border-gray-200`
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div className={getMessageClasses(message.role)}>
            {/* Message content with enhanced formatting */}
            <div className="message-content">
              {formatMessageContent(message.content)}
            </div>
            
            {/* Timestamp */}
            <div
              className={`text-xs mt-2 opacity-70 ${
                message.role === 'user' 
                  ? 'text-blue-100' 
                  : 'text-gray-500'
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      ))}

      {/* Streaming message with typing indicator */}
      {streamingMessage && (
        <div className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] rounded-lg px-4 py-3 text-sm break-words bg-gray-50 text-gray-800 border border-gray-200">
            {streamingMessage.content ? (
              <div className="message-content">
                {formatMessageContent(streamingMessage.content)}
                <div className="mt-2">
                  <TypingIndicator />
                </div>
              </div>
            ) : (
              <TypingIndicator />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to format date - using a simple approach to avoid external deps
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'just now' : 'now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}${suffix}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}${suffix}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}${suffix}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  const suffix = options?.addSuffix ? ' ago' : ''
  return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''}${suffix}`
}