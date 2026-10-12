"use client";

import Link from "next/link";
import { Plus, Search, Edit, Trash2, FolderSearch, AlertCircle, CheckCircle2, X, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminDataTable({
  title,
  description,
  data: initialData,
  columns,
  createUrl,
  modelName,
  entitySlug,
}: {
  title: string;
  description: string;
  data: any[];
  columns: { key: string; label: string }[];
  createUrl?: string;
  modelName?: string;
  entitySlug?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Modal & Toast States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isRowPending = (row: any) => {
    if (!modelName) return false;
    if (typeof row.approved === "boolean") return !row.approved;
    if (typeof row.status === "string") {
      return ["DRAFT", "SUBMITTED", "PENDING", "IN_REVIEW", "UNREAD"].includes(row.status.toUpperCase());
    }
    return false;
  };

  const pendingCount = data.filter(isRowPending).length;

  const handleApproveRow = async (id: string) => {
    if (!modelName || !id) return;
    setApprovingId(id);
    try {
      const res = await fetch("/api/admin/crud", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName, id, action: "approve" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) =>
          prev.map((row) => {
            if (row.id !== id) return row;
            if (typeof row.approved === "boolean") return { ...row, approved: true };
            if (modelName.toLowerCase() === "contactmessage") return { ...row, status: "READ" };
            return { ...row, status: "PUBLISHED" };
          })
        );
        showToast("Record approved & published!", "success");
        router.refresh();
      } else {
        showToast(json.error || "Failed to approve record.", "error");
      }
    } catch {
      showToast("Network error approving record.", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleBulkAutoApprove = async () => {
    if (!modelName || pendingCount === 0) return;
    setIsBulkApproving(true);
    try {
      const res = await fetch("/api/admin/crud", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName, action: "bulk-approve" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) =>
          prev.map((row) => {
            if (!isRowPending(row)) return row;
            if (typeof row.approved === "boolean") return { ...row, approved: true };
            if (modelName.toLowerCase() === "contactmessage") return { ...row, status: "READ" };
            return { ...row, status: "PUBLISHED" };
          })
        );
        showToast(`Auto-approved ${json.count ?? pendingCount} pending records!`, "success");
        router.refresh();
      } else {
        showToast(json.error || "Failed to bulk approve records.", "error");
      }
    } catch {
      showToast("Network error during bulk auto-approve.", "error");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || !modelName) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/crud?model=${modelName}&id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(row => row.id !== deleteId));
        showToast("Record permanently deleted", "success");
        router.refresh();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to delete record.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error deleting record.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return columns.some((col) => {
      const val = row[col.key];
      if (val == null) return false;
      return String(val).toLowerCase().includes(query);
    });
  });

  return (
    <div className="container mx-auto max-w-7xl py-8 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in font-medium text-sm text-white ${toast.type === 'error' ? 'bg-destructive/90 border border-destructive' : 'bg-green-600/90 border border-green-500'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
            <h3 className="text-xl font-heading font-bold mb-2 flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Confirm Deletion
            </h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Are you absolutely sure you want to permanently delete this record? This action cannot be undone and will immediately reflect across the platform.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {modelName && pendingCount > 0 && (
            <button
              onClick={handleBulkAutoApprove}
              disabled={isBulkApproving}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isBulkApproving ? "Approving..." : `Auto-Approve Pending (${pendingCount})`}
            </button>
          )}
          {createUrl && (
            <Link
              href={createUrl}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add New {title.replace(/s$/, '')}
            </Link>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${filteredData.length} records...`}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-muted rounded-full text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-5 font-bold tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FolderSearch className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-base font-bold">{searchQuery ? "No matching records found" : `No ${title.toLowerCase()} found`}</p>
                      <p className="text-sm mt-1">{searchQuery ? `Try adjusting your search query for "${searchQuery}".` : "Start by creating your first record using the button above."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr 
                    key={row.id || i} 
                    onClick={() => { if (entitySlug && row.id) router.push(`/admin/${entitySlug}/${row.id}/edit`); }}
                    className={`hover:bg-muted/30 cursor-pointer transition-colors group ${deleteId === row.id ? 'opacity-50' : ''}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-5 whitespace-nowrap">
                        <span className="font-medium text-foreground/90 group-hover:text-foreground transition-colors">{String(row[col.key] ?? '—')}</span>
                      </td>
                    ))}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        {isRowPending(row) && row.id && (
                          <button
                            onClick={() => handleApproveRow(row.id)}
                            disabled={approvingId === row.id}
                            title="1-Click Approve & Publish"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {approvingId === row.id ? "..." : "Approve"}
                          </button>
                        )}
                        {entitySlug && row.id && (
                          <Link href={`/admin/${entitySlug}/${row.id}/edit`} className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-xl">
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        <button 
                          onClick={() => setDeleteId(row.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
