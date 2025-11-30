import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'images', 'logo', 'soursync-logo.svg')
    const fileContents = await readFile(filePath, 'utf-8')
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving favicon:', error)
    return new NextResponse('Not Found', { status: 404 })
  }
}

