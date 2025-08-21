import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload to Cosmic
    const response = await cosmic.media.insertOne({
      media: file,
      folder: 'chat-uploads'
    })

    return NextResponse.json({
      url: response.media.url,
      name: response.media.name,
      size: response.media.size,
      type: response.media.type
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File upload endpoint',
    maxSize: '10MB',
    supportedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  })
}