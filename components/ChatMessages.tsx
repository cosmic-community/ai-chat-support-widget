import type { ChatMessage } from '@/types'
import TypingIndicator from '@/components/TypingIndicator'
import { formatDistanceToNow } from 'date-fns'

interface ChatMessagesProps {
  messages: ChatMessage[]
  streamingMessage?: ChatMessage | null
}

export default function ChatMessages({ messages, streamingMessage }: ChatMessagesProps) {
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const formatMessageContent = (content: string) => {
    // Convert newlines to line breaks
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm break-words message-enter ${
              message.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div>{formatMessageContent(message.content)}</div>
            <div
              className={`text-xs mt-1 opacity-75 ${
                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      ))}

      {streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm break-words bg-gray-100 text-gray-900">
            {streamingMessage.content ? (
              <>
                <div>{formatMessageContent(streamingMessage.content)}</div>
                <TypingIndicator />
              </>
            ) : (
              <TypingIndicator />
            )}
          </div>
        </div>
      )}
    </>
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
    return `${diffInMinutes}m${suffix}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInHours}h${suffix}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  const suffix = options?.addSuffix ? ' ago' : ''
  return `${diffInDays}d${suffix}`
}