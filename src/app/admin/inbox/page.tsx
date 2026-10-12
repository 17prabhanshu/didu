export const dynamic = 'force-dynamic';
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Mail, CheckCircle, Clock, Search, Filter, ChevronDown } from "lucide-react";

export default async function AdminInboxPage() {
  const session = await requireAuth();
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-heading text-4xl font-bold mb-2">Contact Inbox</h1>
          <p className="text-muted-foreground">Manage and respond to contact form submissions</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-12 pr-4 py-2 rounded-xl border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Filter className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">From</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Subject</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Message Preview</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase">Status</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase text-right">Received</th>
                <th className="p-4 font-bold text-sm text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{msg.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{msg.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium line-clamp-1">{msg.subject || 'No Subject'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-muted-foreground line-clamp-2 max-w-xs">{msg.message}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono ${
                      msg.status === 'UNREAD' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : msg.status === 'READ' 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {msg.status === 'UNREAD' && <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5" />}
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground">
                    {formatDate(msg.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/inbox/${msg.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-medium hover:bg-primary/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}