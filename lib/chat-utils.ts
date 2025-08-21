import type { ChatMessage, ChatSession } from '@/types'

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Create a new chat message
export function createMessage(
  role: 'user' | 'assistant',
  content: string,
  isStreaming = false
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date(),
    isStreaming
  }
}

// Create a new chat session
export function createChatSession(): ChatSession {
  return {
    id: generateId(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Format chat messages for AI API
export function formatMessagesForAI(messages: ChatMessage[]) {
  return messages
    .filter(msg => !msg.isStreaming)
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }))
}

// Truncate messages to stay within token limits
export function truncateMessages(messages: ChatMessage[], maxMessages = 10): ChatMessage[] {
  if (messages.length <= maxMessages) {
    return messages
  }
  
  // Keep the first message (usually system/greeting) and the last N messages
  const systemMessage = messages[0]?.role === 'assistant' ? messages[0] : null
  const recentMessages = messages.slice(-maxMessages)
  
  if (systemMessage && recentMessages[0]?.id !== systemMessage.id) {
    return [systemMessage, ...recentMessages.slice(1)]
  }
  
  return recentMessages
}

// Clean up streaming message content
export function cleanStreamingContent(content: string): string {
  // Remove any incomplete sentences or weird artifacts
  return content.trim()
}

// Validate file for upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' }
  }
  
  return { valid: true }
}

// Storage utilities for session persistence
export const chatStorage = {
  saveSession: (session: ChatSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cosmic-chat-session', JSON.stringify(session))
    }
  },
  
  loadSession: (): ChatSession | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem('cosmic-chat-session')
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      // Convert date strings back to Date objects
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        messages: parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
    } catch {
      return null
    }
  },
  
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cosmic-chat-session')
    }
  }
}