"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reply, CheckCircle2, AlertCircle, Loader2, Send, Mail, Archive, Clock } from "lucide-react";

interface InboxReplyClientProps {
  message: {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    status: string;
  };
}

export function InboxReplyClient({ message }: InboxReplyClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(message.status);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateStatus = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/inbox/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update status");
      setStatus(newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inbox/${message.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage: replyText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send reply");

      setStatus("REPLIED");
      setShowReplyBox(false);
      setReplyText("");
      showToast(data.message || "Reply sent successfully!", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const mailtoUrl = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
    `Re: ${message.subject || "Your Inquiry"}`
  )}`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 font-medium text-sm text-white ${
            toast.type === "error" ? "bg-destructive border border-destructive" : "bg-green-600 border border-green-500"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
        {/* Status Change Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Status:</span>
          <button
            type="button"
            onClick={() => updateStatus("READ")}
            disabled={statusLoading || status === "READ"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              status === "READ"
                ? "bg-green-500/10 text-green-600 border border-green-500/30"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Mark Read
          </button>
          <button
            type="button"
            onClick={() => updateStatus("REPLIED")}
            disabled={statusLoading || status === "REPLIED"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              status === "REPLIED"
                ? "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Mark Replied
          </button>
          <button
            type="button"
            onClick={() => updateStatus("ARCHIVED")}
            disabled={statusLoading || status === "ARCHIVED"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              status === "ARCHIVED"
                ? "bg-gray-500/10 text-gray-600 border border-gray-500/30"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Archive
          </button>
        </div>

        {/* Reply Trigger Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={mailtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" /> Open in Mail Client
          </a>
          <button
            type="button"
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground py-2.5 px-5 rounded-xl font-bold hover:opacity-90 transition-opacity text-sm shadow-md"
          >
            <Reply className="w-4 h-4" />
            {showReplyBox ? "Close Composer" : "Compose Reply"}
          </button>
        </div>
      </div>

      {/* In-Page Reply Composer */}
      {showReplyBox && (
        <form onSubmit={handleSendReply} className="mt-6 p-6 rounded-2xl bg-muted/30 border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm">Send Reply to {message.name} ({message.email})</h4>
            <span className="text-xs text-muted-foreground">Subject: Re: {message.subject || "Your Inquiry"}</span>
          </div>
          <textarea
            rows={5}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={loading}
            placeholder="Type your response here..."
            className="w-full p-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowReplyBox(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !replyText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
