import { NextRequest, NextResponse } from 'next/server'
import { streamAIResponse } from '@/lib/cosmic'
import type { ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, fileUrl, maxTokens = 500 } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Add system prompt for better customer service responses
    const systemPrompt = "You are a helpful AI customer support assistant. Provide clear, friendly, and professional responses. If you're analyzing a file, explain what you found in an accessible way."
    
    const formattedMessages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Configure streaming parameters
    const streamParams = {
      messages: formattedMessages,
      max_tokens: maxTokens,
      stream: true,
      ...(fileUrl && { media_url: fileUrl })
    }

    const stream = await streamAIResponse(streamParams)

    // Create a ReadableStream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream as any) {
            if (chunk.text) {
              const data = JSON.stringify({ text: chunk.text })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
            
            if (chunk.usage) {
              const data = JSON.stringify({ usage: chunk.usage })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
            
            if (chunk.end) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              break
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Streaming failed' 
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Chat API is running',
    endpoints: {
      POST: '/api/chat - Stream chat responses',
      'POST /api/upload': 'Upload files for analysis'
    }
  })
}