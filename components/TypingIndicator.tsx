export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 py-1">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
    </div>
  )
}