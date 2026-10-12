export const dynamic = 'force-dynamic';
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Mail, ArrowLeft, CheckCircle, Clock, Reply } from "lucide-react";
import { InboxReplyClient } from "@/components/admin/inbox-reply-client";

export default async function AdminInboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;

  const message = await db.contactMessage.findUnique({
    where: { id },
  });

  if (!message) {
    notFound();
  }

  // Mark as read if unread
  if (message.status === 'UNREAD') {
    await db.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/inbox"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Inbox
        </Link>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">{message.subject || 'No Subject'}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className="font-mono">{message.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{message.name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(message.createdAt)}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono ${
                  message.status === 'UNREAD' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : message.status === 'READ' 
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {message.status === 'UNREAD' && <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5" />}
                  {message.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none bg-muted/30 rounded-xl p-6">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>

            <div className="mt-8">
              <InboxReplyClient message={message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}