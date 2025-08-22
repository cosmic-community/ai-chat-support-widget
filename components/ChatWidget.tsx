'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Paperclip, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import ChatMessages from '@/components/ChatMessages'
import FileUpload from '@/components/FileUpload'
import type { ChatMessage, ChatSession, WidgetConfig, WidgetState, FileUpload as FileUploadType } from '@/types'
import { createMessage, createChatSession, formatMessagesForAI, truncateMessages, chatStorage } from '@/lib/chat-utils'

interface ChatWidgetProps {
  position?: WidgetConfig['position']
  primaryColor?: string
  greeting?: string
  title?: string
  placeholder?: string
  maxMessages?: number
  allowFileUpload?: boolean
  customPrompt?: string
}

export default function ChatWidget({
  position = 'bottom-right',
  primaryColor = '#3B82F6',
  greeting = "Hi! I'm your cooking assistant. Ask me about our recipes, ingredients, cooking techniques, or any culinary questions you have!",
  title = "Recipe Chat Support",
  placeholder = "Ask about recipes, cooking tips, ingredients...",
  maxMessages = 50,
  allowFileUpload = true,
  customPrompt
}: ChatWidgetProps) {
  const [state, setState] = useState<WidgetState>('minimized')
  const [session, setSession] = useState<ChatSession | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null)
  const [uploadedFile, setUploadedFile] = useState<FileUploadType | null>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize session
  useEffect(() => {
    const savedSession = chatStorage.loadSession()
    if (savedSession) {
      setSession(savedSession)
    } else {
      const newSession = createChatSession()
      // Add greeting message
      newSession.messages.push(createMessage('assistant', greeting))
      setSession(newSession)
      chatStorage.saveSession(newSession)
    }
  }, [greeting])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [session?.messages, currentStreamingMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputValue])

  const toggleWidget = () => {
    setState(prev => prev === 'minimized' ? 'open' : 'minimized')
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !session) return

    const userMessage = createMessage('user', inputValue.trim())
    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: new Date()
    }

    setSession(updatedSession)
    setInputValue('')
    setIsLoading(true)
    chatStorage.saveSession(updatedSession)

    // Clear any uploaded file reference after sending
    const currentFileUrl = uploadedFile?.url
    setUploadedFile(null)
    setShowFileUpload(false)

    try {
      // Create streaming message
      const streamingMessage = createMessage('assistant', '', true)
      setCurrentStreamingMessage(streamingMessage)

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const messages = truncateMessages(updatedSession.messages, maxMessages)
      const formattedMessages = formatMessagesForAI(messages)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          fileUrl: currentFileUrl,
          maxTokens: 800
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let fullResponse = ''
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullResponse += parsed.text
                setCurrentStreamingMessage(prev => prev ? {
                  ...prev,
                  content: fullResponse
                } : null)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (data !== '[DONE]') {
                console.warn('Failed to parse streaming data:', data)
              }
            }
          }
        }
      }

      // Finalize the message
      if (fullResponse) {
        const finalMessage = createMessage('assistant', fullResponse)
        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, finalMessage],
          updatedAt: new Date()
        }
        setSession(finalSession)
        chatStorage.saveSession(finalSession)
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was aborted, ignore
      }

      console.error('Chat error:', error)
      const errorMessage = createMessage(
        'assistant',
        'Sorry, I encountered an error while accessing the recipe knowledge base. Please try again.'
      )
      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date()
      }
      setSession(errorSession)
      chatStorage.saveSession(errorSession)
    } finally {
      setIsLoading(false)
      setCurrentStreamingMessage(null)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (file: FileUploadType) => {
    setUploadedFile(file)
    setShowFileUpload(false)
    setInputValue(prev => prev + (prev ? '\n' : '') + `[Attached: ${file.name}]`)
  }

  const clearChat = () => {
    if (!session) return
    const newSession = createChatSession()
    newSession.messages.push(createMessage('assistant', greeting))
    setSession(newSession)
    chatStorage.saveSession(newSession)
    setUploadedFile(null)
    setCurrentStreamingMessage(null)
  }

  const positionClasses = {
    'bottom-right': 'widget-bottom-right',
    'bottom-left': 'widget-bottom-left',
    'top-right': 'widget-top-right',
    'top-left': 'widget-top-left'
  }

  if (!session) return null

  return (
    <div className={clsx('fixed z-50', positionClasses[position])}>
      {state === 'minimized' ? (
        // Minimized state - floating button
        <button
          onClick={toggleWidget}
          className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: primaryColor }}
          aria-label="Open recipe chat"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        // Open state - full chat window
        <div className="bg-white rounded-lg shadow-xl border w-96 max-w-[calc(100vw-20px)] h-[500px] flex flex-col">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b bg-primary-500 text-white rounded-t-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <h3 className="font-semibold">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-white/80 hover:text-white text-sm"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={toggleWidget}
                className="text-white/80 hover:text-white"
                aria-label="Minimize chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <ChatMessages 
              messages={session.messages}
              streamingMessage={currentStreamingMessage}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload */}
          {showFileUpload && allowFileUpload && (
            <div className="border-t p-4">
              <FileUpload 
                onUpload={handleFileUpload}
                onClose={() => setShowFileUpload(false)}
              />
            </div>
          )}

          {/* File indicator */}
          {uploadedFile && (
            <div className="px-4 py-2 border-t bg-gray-50 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  📎 {uploadedFile.name}
                </span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              {allowFileUpload && (
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                  title="Attach recipe photo or document"
                >
                  <Paperclip size={18} />
                </button>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm max-h-20"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={clsx(
                  "p-2 rounded-lg text-white transition-colors",
                  inputValue.trim() && !isLoading
                    ? "bg-primary-500 hover:bg-primary-600"
                    : "bg-gray-300 cursor-not-allowed"
                )}
                style={{ 
                  backgroundColor: inputValue.trim() && !isLoading ? primaryColor : undefined 
                }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}