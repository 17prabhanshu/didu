import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { sendContactReplyEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { status } = body;
    if (!status) {
      return NextResponse.json({ error: "Missing status parameter" }, { status: 400 });
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const { replyMessage } = body;
    if (!replyMessage || !replyMessage.trim()) {
      return NextResponse.json({ error: "Reply message cannot be empty" }, { status: 400 });
    }

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Send reply email via Resend
    const sent = await sendContactReplyEmail(
      message.email,
      message.name,
      message.subject || "Your Inquiry",
      replyMessage
    );

    // Update status to REPLIED
    const updated = await db.contactMessage.update({
      where: { id },
      data: { status: "REPLIED" },
    });

    return NextResponse.json({ 
      success: true, 
      sent, 
      message: sent ? "Reply sent successfully!" : "Reply recorded (email service not configured).",
      data: updated 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
