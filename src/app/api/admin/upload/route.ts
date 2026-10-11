import { NextResponse } from "next/server";
import { requireRole, getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export async function POST(req: Request) {
  try {
    const session = await requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR']);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // SECURITY: Validate file type by magic bytes, not just extension
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." }, { status: 400 });
    }

    // Also validate extension as a secondary check
    let originalExt = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
      return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
    }

    // Use the detected MIME type for storage
    const detectedExt = fileType.ext;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}.${detectedExt}`;
    
    let publicUrl = "";

    // ARCHITECTURE UPGRADE: Vercel Blob (Serverless) vs Local Fallback
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // VERCEL PRODUCTION: Upload to Vercel Blob for persistent edge storage
      const blob = await put(`uploads/${filename}`, buffer, {
        access: 'public',
        contentType: fileType.mime,
      });
      publicUrl = blob.url;
    } else {
      // LOCAL DEV FALLBACK: Write to local fs if no blob token exists
      const uploadsDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true }).catch(() => {});
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      publicUrl = `/uploads/${filename}`;
    }

    // Record in DB
    const mediaAsset = await db.mediaAsset.create({
      data: {
        filename: file.name,
        url: publicUrl,
        mimeType: fileType.mime,
        size: file.size,
        uploadedById: session.userId,
      }
    });

    return NextResponse.json({ success: true, url: publicUrl, asset: mediaAsset });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
