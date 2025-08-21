import { createBucketClient } from '@cosmicjs/sdk'
import type { AIGenerateTextParams, AIStreamResponse } from '@/types'

if (!process.env.COSMIC_BUCKET_SLUG) {
  throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
}

if (!process.env.COSMIC_WRITE_KEY) {
  throw new Error('COSMIC_WRITE_KEY environment variable is required')
}

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

// Stream AI response with proper error handling
export async function streamAIResponse(params: AIGenerateTextParams) {
  try {
    const response = await cosmic.ai.generateText({
      ...params,
      stream: true
    })
    
    return response
  } catch (error) {
    console.error('AI streaming error:', error)
    if (hasStatus(error) && error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (hasStatus(error) && error.status === 401) {
      throw new Error('Authentication failed. Please check your API key.')
    }
    throw new Error('Failed to generate AI response. Please try again.')
  }
}

// Generate single AI response without streaming
export async function generateAIResponse(params: Omit<AIGenerateTextParams, 'stream'>) {
  try {
    const response = await cosmic.ai.generateText({
      ...params,
      stream: false
    })
    
    return response
  } catch (error) {
    console.error('AI generation error:', error)
    if (hasStatus(error) && error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    throw new Error('Failed to generate response')
  }
}

// Upload file for AI analysis
export async function uploadFileForAnalysis(file: File, folder = 'chat-uploads'): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('media', file)
    formData.append('folder', folder)
    
    const response = await cosmic.media.insertOne({
      media: file,
      folder
    })
    
    return response.media.url
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('Failed to upload file')
  }
}

// Get bucket info for client-side usage
export function getBucketInfo() {
  return {
    bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  }
}