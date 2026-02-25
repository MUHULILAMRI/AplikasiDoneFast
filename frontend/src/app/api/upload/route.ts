import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file size (max 10MB for now)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'File size exceeds 10MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const fileName = `${uuidv4()}.${extension}`;

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // already exists or other error
        }

        const path = join(uploadDir, fileName);
        await writeFile(path, buffer);

        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            data: {
                url: fileUrl,
                name: originalName,
                size: file.size,
                type: file.type
            }
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
