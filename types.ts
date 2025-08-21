// Base types for the chat widget
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface WidgetConfig {
  bucketSlug: string
  apiKey?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  primaryColor?: string
  greeting?: string
  title?: string
  placeholder?: string
  maxMessages?: number
  allowFileUpload?: boolean
  customPrompt?: string
}

export interface FileUpload {
  file: File
  url?: string
  type: string
  size: number
  name: string
}

// Cosmic AI types
export interface AIStreamResponse {
  text?: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
  end?: boolean
  error?: string
}

export interface AIGenerateTextParams {
  prompt?: string
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  max_tokens?: number
  media_url?: string
  stream?: boolean
}

export interface AIGenerateImageParams {
  prompt: string
  folder?: string
  alt_text?: string
  metadata?: Record<string, any>
}

// Widget state types
export type WidgetState = 'minimized' | 'open' | 'loading'

export interface WidgetPosition {
  bottom?: number
  right?: number
  left?: number
  top?: number
}

// Error types
export interface ChatError {
  message: string
  code?: string
  retryable?: boolean
}

// Utility types
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
export type RequiredConfig = OptionalExcept<WidgetConfig, 'bucketSlug'>