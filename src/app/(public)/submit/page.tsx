"use client";

import { useState } from "react";
import { Sparkles, Bot, Wrench, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SubmitPage() {
  const [submissionType, setSubmissionType] = useState<"tool" | "agent" | "article">("tool");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    entityName: "",
    websiteUrl: "",
    githubUrl: "",
    description: "",
    extraDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const subjectPrefix = submissionType === "tool" ? "[Tool Submission]" : submissionType === "agent" ? "[Agent Submission]" : "[Guest Post Pitch]";
    const messageBody = `
Submission Type: ${submissionType.toUpperCase()}
Submitter Name: ${formData.name}
Submitter Email: ${formData.email}
Resource / Item Name: ${formData.entityName}
Website / Official URL: ${formData.websiteUrl || "N/A"}
GitHub / Repository URL: ${formData.githubUrl || "N/A"}

Description:
${formData.description}

Additional Notes / Architecture Details:
${formData.extraDetails || "None provided"}
    `.trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `${subjectPrefix} ${formData.entityName}`,
          message: messageBody,
          submissionType,
          entityName: formData.entityName,
          websiteUrl: formData.websiteUrl,
          githubUrl: formData.githubUrl,
          description: formData.description,
          extraDetails: formData.extraDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-accent/20 via-accent/5 to-transparent mix-blend-multiply pointer-events-none -z-10" />

      <div className="container mx-auto py-20 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Ecosystem Directory Submission
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Showcase Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Creation</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Submit your autonomous agent, developer tool, or research article for benchmarking and editorial review on Tecrese.
          </p>
        </div>

        {success ? (
          <div className="bg-card border border-primary/20 p-10 md:p-14 rounded-[2.5rem] text-center shadow-2xl max-w-2xl mx-auto animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-heading text-3xl font-bold mb-3">Submission Received!</h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto mb-8 leading-relaxed">
              Thank you for contributing to the directory. Our team reviews all submissions for safety, autonomy benchmarks, and accuracy within 48–72 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: "",
                    email: "",
                    entityName: "",
                    websiteUrl: "",
                    githubUrl: "",
                    description: "",
                    extraDetails: "",
                  });
                }}
                className="px-6 py-3 rounded-full bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm transition-colors"
              >
                Submit Another Item
              </button>
              <Link
                href="/tools"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1.5"
              >
                Browse Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card/80 backdrop-blur-xl border border-border/70 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-10 p-1.5 bg-muted/50 rounded-2xl border border-border/50">
              <button
                type="button"
                onClick={() => setSubmissionType("tool")}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  submissionType === "tool"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Wrench className="w-4 h-4" /> Developer Tool
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("agent")}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  submissionType === "agent"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Bot className="w-4 h-4" /> Autonomous Agent
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("article")}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  submissionType === "article"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FileText className="w-4 h-4" /> Guest Post / Guide
              </button>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Rivera"
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  {submissionType === "article" ? "Proposed Article Title *" : "Tool / Agent Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  placeholder={submissionType === "article" ? "Building Resilient Memory Systems with LangGraph" : "AgenticDev"}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    {submissionType === "article" ? "Draft / Outline Link" : "Official Website URL"}
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    {submissionType === "article" ? "Author Portfolio / GitHub" : "GitHub / Source Code URL"}
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/organization/repo"
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  {submissionType === "article" ? "Article Outline / Key Takeaways *" : "Overview & Value Proposition *"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what makes this unique, its architecture, and target audience..."
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Additional Architecture or Security Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.extraDetails}
                  onChange={(e) => setFormData({ ...formData, extraDetails: e.target.value })}
                  placeholder="Licensing, token usage benchmarks, MCP compliance, or API endpoints..."
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Editorial Review"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
