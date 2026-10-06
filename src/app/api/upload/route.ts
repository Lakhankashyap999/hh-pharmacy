import { NextRequest, NextResponse } from 'next/server'

/**
 * Prescription upload.
 * Vercel serverless has a read-only filesystem, so files can never be written to /public.
 * Instead the (already browser-compressed) image is validated and returned as a data URL,
 * which is stored with the order in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const MAX_SIZE = 3 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 3MB limit' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WEBP and PDF are accepted.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = `data:${file.type};base64,${buffer.toString('base64')}`
    return NextResponse.json({ url, name: file.name, size: file.size }, { status: 201 })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
