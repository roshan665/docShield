"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Search,
  RefreshCw,
  Eye,
  History,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Brain,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  Document,
  DocumentAIInsights,
  DocumentClassification,
  DocumentIntegrityCheckResult,
  DocumentType,
  DocumentVersion,
} from "@/types";
import {
  listCaseDocuments,
  listAllAccessibleDocuments,
  uploadDocument,
  uploadDocumentVersion,
  listDocumentVersions,
  verifyDocumentIntegrity,
  downloadDocument,
  saveBlobAsFile,
  getDocumentAIInsights,
  processDocumentAI,
  verifyExtractedEntity,
} from "@/lib/api";

interface DocumentVaultProps {
  caseId?: string;
  caseTitle?: string;
  canUpload?: boolean;
  onDocumentCountChange?: (count: number) => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  fir: "First Information Report (FIR)",
  police_report: "Police Investigation Report",
  witness_statement: "Witness Deposition / Statement",
  forensic_report: "Forensic Laboratory Report",
  court_filing: "Court Filing / Judicial Order",
  seizure_memo: "Seizure / Panchnama Memo",
  charge_sheet: "Charge Sheet (Final Report)",
  medical_report: "Medico-Legal / Autopsy Report",
  identification_doc: "Identification Document",
  supporting_document: "Supporting Evidence Document",
  other: "Other Legal Filing",
};

const CLASSIFICATION_COLORS: Record<DocumentClassification, string> = {
  unclassified: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  restricted: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
  confidential: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
  secret: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300",
  top_secret: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-400 font-bold",
};

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function DocumentVault({
  caseId,
  caseTitle,
  canUpload = true,
  onDocumentCountChange,
}: DocumentVaultProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeDocForVersion, setActiveDocForVersion] = useState<Document | null>(null);
  const [activeDocForHistory, setActiveDocForHistory] = useState<Document | null>(null);
  const [versionsList, setVersionsList] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Live verification state
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [integrityResults, setIntegrityResults] = useState<Record<string, DocumentIntegrityCheckResult>>({});
  const [showIntegrityModal, setShowIntegrityModal] = useState<DocumentIntegrityCheckResult | null>(null);

  // Download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Copy hash state
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("fir");
  const [uploadClassification, setUploadClassification] = useState<DocumentClassification>("unclassified");
  const [uploading, setUploading] = useState(false);

  // Version Upload State
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionChangeReason, setVersionChangeReason] = useState("");
  const [uploadingVersion, setUploadingVersion] = useState(false);

  // AI Insights State
  const [activeDocForAI, setActiveDocForAI] = useState<Document | null>(null);
  const [aiInsights, setAiInsights] = useState<DocumentAIInsights | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [reprocessingAI, setReprocessingAI] = useState(false);
  const [verifyingEntityId, setVerifyingEntityId] = useState<string | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      let docs: Document[] = [];
      if (caseId) {
        docs = await listCaseDocuments(caseId, {
          document_type: typeFilter !== "all" ? typeFilter : undefined,
          search: searchQuery || undefined,
        });
      } else {
        docs = await listAllAccessibleDocuments({
          document_type: typeFilter !== "all" ? typeFilter : undefined,
          search: searchQuery || undefined,
        });
      }
      setDocuments(docs);
      if (onDocumentCountChange) {
        onDocumentCountChange(docs.length);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [caseId, typeFilter, searchQuery, onDocumentCountChange]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle Copy Hash
  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Handle AI Insights
  const handleOpenAIInsights = async (doc: Document) => {
    setActiveDocForAI(doc);
    setShowOcrText(false);
    try {
      setLoadingAI(true);
      setErrorMsg(null);
      let insights = await getDocumentAIInsights(doc.id);
      if (!insights.ai_processed) {
        // Auto trigger pipeline if not yet processed
        insights = await processDocumentAI(doc.id);
      }
      setAiInsights(insights);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load AI insights.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleReprocessAI = async (docId: string) => {
    try {
      setReprocessingAI(true);
      setErrorMsg(null);
      const res = await processDocumentAI(docId);
      setAiInsights(res);
      setSuccessMsg("Document re-processed through the 7-stage AI pipeline successfully.");
      await loadDocuments();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to re-process document.");
    } finally {
      setReprocessingAI(false);
    }
  };

  const handleToggleVerifyEntity = async (docId: string, entityId: string, currentStatus: boolean) => {
    try {
      setVerifyingEntityId(entityId);
      const updated = await verifyExtractedEntity(docId, entityId, !currentStatus);
      setAiInsights((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entities: prev.entities.map((e) => (e.id === entityId ? updated : e)),
        };
      });
      setSuccessMsg(
        !currentStatus
          ? `Entity "${updated.entity_value}" verified by officer.`
          : `Entity "${updated.entity_value}" unverified.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update entity status.");
    } finally {
      setVerifyingEntityId(null);
    }
  };

  // Handle Live Cryptographic Integrity Verification
  const handleVerifyIntegrity = async (doc: Document) => {
    try {
      setVerifyingDocId(doc.id);
      setErrorMsg(null);
      const res = await verifyDocumentIntegrity(doc.id);
      setIntegrityResults((prev) => ({ ...prev, [doc.id]: res }));
      setShowIntegrityModal(res);
      if (res.match) {
        setSuccessMsg(`Cryptographic integrity verified for "${doc.title}". Hash matched S3 storage.`);
      } else {
        setErrorMsg(`ALERT: Document integrity mismatch detected for "${doc.title}"! File may be compromised.`);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifyingDocId(null);
    }
  };

  // Handle Download
  const handleDownload = async (doc: Document, versionId?: string) => {
    const idKey = versionId ? `${doc.id}-${versionId}` : doc.id;
    try {
      setDownloadingId(idKey);
      setErrorMsg(null);
      const { blob, filename } = await downloadDocument(doc.id, versionId);
      saveBlobAsFile(blob, filename || doc.file_name || "document.bin");
      setSuccessMsg(`Document "${doc.title}" downloaded and cryptographically verified.`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Download failed. File may be corrupted or inaccessible.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Open Version History
  const handleOpenHistory = async (doc: Document) => {
    setActiveDocForHistory(doc);
    try {
      setLoadingVersions(true);
      const versions = await listDocumentVersions(doc.id);
      setVersionsList(versions);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load version history.");
    } finally {
      setLoadingVersions(false);
    }
  };

  // Handle Document Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }
    if (!caseId) {
      setErrorMsg("Document upload requires an active case.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);
      if (uploadDesc) formData.append("description", uploadDesc);
      formData.append("document_type", uploadType);
      formData.append("classification", uploadClassification);

      await uploadDocument(caseId, formData);
      setSuccessMsg(`Document "${uploadTitle}" uploaded and hashed successfully.`);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      setUploadType("fir");
      setUploadClassification("unclassified");
      await loadDocuments();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Handle Upload New Version Submit
  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionFile || !activeDocForVersion) {
      setErrorMsg("Please select a file for the new version.");
      return;
    }

    try {
      setUploadingVersion(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append("file", versionFile);
      if (versionChangeReason) {
        formData.append("change_reason", versionChangeReason);
      }

      await uploadDocumentVersion(activeDocForVersion.id, formData);
      setSuccessMsg(`New version recorded for "${activeDocForVersion.title}". Prior version preserved.`);
      setActiveDocForVersion(null);
      setVersionFile(null);
      setVersionChangeReason("");
      await loadDocuments();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload new version.");
    } finally {
      setUploadingVersion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {errorMsg.toLowerCase().includes("session required") && (
              <Link
                href="/login"
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sign In
              </Link>
            )}
            <button onClick={() => setErrorMsg(null)} className="text-xs font-semibold underline ml-2">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-semibold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar & Filter Chips (Matching Reference Panel 5) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search documents by title, file name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs shadow-sm"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDocuments}
            disabled={loading}
            className="h-10 w-10 p-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shrink-0 shadow-sm"
            title="Refresh document vault"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {canUpload && caseId && (
            <Button
              onClick={() => setShowUploadModal(true)}
              size="sm"
              className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Document</span>
            </Button>
          )}
        </div>

        {/* Horizontal Scrolling Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "All Documents" },
            { id: "forensic_report", label: "Forensic" },
            { id: "court_filing", label: "Legal" },
            { id: "police_report", label: "Reports" },
            { id: "fir", label: "FIR" },
            { id: "seizure_memo", label: "Seizure" },
            { id: "witness_statement", label: "Witness" },
          ].map((chip) => {
            const isSelected = typeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setTypeFilter(chip.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all text-xs",
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={caseId ? "No Documents Filed in this Case" : "No Accessible Documents"}
          description={
            caseId
              ? "Upload FIRs, witness depositions, police reports, or forensic filings. All records are cryptographically hashed and version-controlled."
              : "Documents uploaded within your assigned cases will appear in this registry."
          }
        />
      ) : (
        /* Document Cards / Grid (Matching Reference Panel 5) */
        <div className="space-y-3">
          {documents.map((doc) => {
            const result = integrityResults[doc.id];
            const currentVer = doc.current_version;
            const hash = doc.file_hash_sha256 || currentVer?.file_hash_sha256 || "";
            const isCompromised = result && !result.match;
            const isVerified = result && result.match;

            // Determine file icon color
            const mime = (doc.mime_type || "").toLowerCase();
            const fileName = (doc.file_name || doc.title || "").toLowerCase();
            const isPdf = mime.includes("pdf") || fileName.endsWith(".pdf");
            const isWord = mime.includes("word") || fileName.endsWith(".docx") || fileName.endsWith(".doc");
            const isSheet = mime.includes("excel") || mime.includes("spreadsheet") || fileName.endsWith(".xlsx") || fileName.endsWith(".csv");
            const isImg = mime.includes("image") || fileName.endsWith(".jpg") || fileName.endsWith(".png");

            const iconClass = isPdf
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : isWord
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : isSheet
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : isImg
              ? "bg-purple-50 text-purple-600 border-purple-100"
              : "bg-slate-50 text-slate-600 border-slate-100";

            return (
              <Card
                key={doc.id}
                className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* File Icon Box */}
                    <div className={cn("p-2.5 rounded-xl border shrink-0 mt-0.5", iconClass)}>
                      <FileText className="h-5 w-5" />
                    </div>

                    {/* File Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          DOC-{doc.id.slice(0, 6)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          v{currentVer?.version_number || 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-sans">
                        <span>
                          {new Date(doc.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span>{formatBytes(doc.file_size_bytes || currentVer?.file_size_bytes)}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold",
                        isCompromised
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : isVerified
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isCompromised ? "bg-rose-500 animate-pulse" : isVerified ? "bg-emerald-500" : "bg-blue-500"
                        )}
                      />
                      {isCompromised ? "Hash Mismatch" : isVerified ? "Verified" : "Under Review"}
                    </span>
                  </div>
                </div>

                {/* Bottom Details Bar (SHA-256 + Actions) */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-400 select-none">SHA-256:</span>
                      <span className="truncate">{hash || "Calculating..."}</span>
                    </div>
                    {hash && (
                      <button
                        onClick={() => copyToClipboard(hash)}
                        title="Copy SHA-256 Hash"
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                      >
                        {copiedHash === hash ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyIntegrity(doc)}
                        disabled={verifyingDocId === doc.id}
                        className="h-7 px-2.5 text-[11px] rounded-lg border-slate-200 hover:bg-slate-50 gap-1"
                      >
                        {verifyingDocId === doc.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 text-blue-600" />
                        )}
                        Verify
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAIInsights(doc)}
                        className="h-7 px-2.5 text-[11px] rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50 gap-1"
                      >
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        AI Insights
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenHistory(doc)}
                        className="h-7 px-2.5 text-[11px] rounded-lg border-slate-200 hover:bg-slate-50 gap-1"
                      >
                        <History className="h-3 w-3 text-slate-500" />
                        Versions
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      className="h-7 px-3 text-[11px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Upload Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Upload & Register Document
                </h3>
                <p className="text-xs text-slate-500">
                  {caseTitle ? `Filing for case: ${caseTitle}` : "Secure Document Ingestion"}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Picker */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md p-1"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Supported formats: PDF, DOCX, XLSX, JPG, PNG (Max: 50MB). Automatically validated against magic-byte spoofing and scanned for malware.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g., Primary Crime Scene Seizure Memo"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Type and Classification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100"
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Security Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadClassification}
                    onChange={(e) => setUploadClassification(e.target.value as DocumentClassification)}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="unclassified">Unclassified</option>
                    <option value="restricted">Restricted</option>
                    <option value="confidential">Confidential</option>
                    <option value="secret">Secret</option>
                    <option value="top_secret">Top Secret</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Filing Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, officer notes, or reference numbers..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60 flex items-start gap-2 text-[11px] text-blue-800 dark:text-blue-300">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  This file will be sanitized, cryptographically hashed using SHA-256, deposited into private object storage, and anchored into the immutable case audit ledger.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploading || !uploadFile || !uploadTitle}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Ingesting & Hashing...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" /> Confirm Ingestion
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload New Version */}
      {activeDocForVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Upload New Version
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">
                  Document: {activeDocForVersion.title} (Currently v{activeDocForVersion.current_version?.version_number || 1})
                </p>
              </div>
              <button
                onClick={() => setActiveDocForVersion(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleVersionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Updated File Payload <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md p-1"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Amendment / New Version
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Appended supplementary witness deposition or court corrections..."
                  value={versionChangeReason}
                  onChange={(e) => setVersionChangeReason(e.target.value)}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
                Notice: The previous version will remain permanently preserved and accessible in the audit-logged version history.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveDocForVersion(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploadingVersion || !versionFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                >
                  {uploadingVersion ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Storing Version...
                    </>
                  ) : (
                    "Publish New Version"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Version History Dialog */}
      {activeDocForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Document Version History
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {activeDocForHistory.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDocForHistory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingVersions ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : versionsList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No historical versions found.</p>
              ) : (
                versionsList.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={ver.version_number === versionsList[0]?.version_number ? "default" : "secondary"}
                          className="text-xs font-mono font-bold"
                        >
                          v{ver.version_number}
                        </Badge>
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {ver.file_name}
                        </span>
                        {ver.version_number === versionsList[0]?.version_number && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Current)</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(activeDocForHistory, ver.id)}
                        disabled={downloadingId === `${activeDocForHistory.id}-${ver.id}`}
                        className="h-7 text-xs flex items-center gap-1 border-slate-300 dark:border-slate-700"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                      <div>Size: {formatBytes(ver.file_size_bytes)}</div>
                      <div>Uploaded by: {ver.uploader_name || "Investigator"}</div>
                      <div>Date: {new Date(ver.created_at).toLocaleString("en-IN")}</div>
                    </div>

                    {ver.change_reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800 italic">
                        Reason: &quot;{ver.change_reason}&quot;
                      </p>
                    )}

                    {/* Hash */}
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-slate-400 select-none">SHA-256:</span>
                        <span className="truncate">{ver.file_hash_sha256}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ver.file_hash_sha256)}
                        className="p-0.5 hover:text-slate-900 dark:hover:text-white"
                      >
                        {copiedHash === ver.file_hash_sha256 ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setActiveDocForHistory(null)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Live Integrity Verification Details */}
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {showIntegrityModal.match ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Live SHA-256 Integrity Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified against MinIO S3 Object Storage payload
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIntegrityModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div
                className={`p-3 rounded-lg border ${
                  showIntegrityModal.match
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200"
                    : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  {showIntegrityModal.match ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> INTEGRITY INTACT & VERIFIED
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" /> INTEGRITY COMPROMISED / HASH MISMATCH
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px]">
                  {showIntegrityModal.match
                    ? "The stored file bytes on MinIO match the cryptographic signature calculated at registration. No tampering detected."
                    : "The file bytes on storage do NOT match the registered cryptographic signature. An alert has been recorded in the audit trail."}
                </p>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Registered Document Hash (Database):</span>
                  <span className="break-all text-slate-800 dark:text-slate-200">{showIntegrityModal.stored_hash}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Streamed Payload Hash (MinIO S3):</span>
                  <span className={`break-all ${showIntegrityModal.match ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}>
                    {showIntegrityModal.calculated_hash}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Version: v{showIntegrityModal.version_number}</span>
                <span>Checked At: {new Date(showIntegrityModal.checked_at).toLocaleTimeString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button size="sm" onClick={() => setShowIntegrityModal(null)}>
                Acknowledge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: AI Document Intelligence & Insights */}
      {activeDocForAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    AI Document Intelligence
                    <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300 text-[10px]">
                      7-Stage Pipeline
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    Document: {activeDocForAI.title} ({activeDocForAI.file_name || "document"})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reprocessingAI || loadingAI}
                  onClick={() => handleReprocessAI(activeDocForAI.id)}
                  className="h-8 text-xs border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3 w-3 ${reprocessingAI ? "animate-spin" : ""}`} />
                  Re-process AI
                </Button>
                <button
                  onClick={() => setActiveDocForAI(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {loadingAI ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Running 7-stage AI pipeline (Extraction &rarr; OCR &rarr; Classification &rarr; NER &rarr; Summary &rarr; Chunks &rarr; Embeddings)...
                </p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4 text-xs">
                {/* Status & Classification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-purple-600 dark:text-purple-400 block">
                      AI Classification
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                      {aiInsights.ai_classification || activeDocForAI.document_type}
                    </span>
                    {aiInsights.ai_confidence != null && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        Confidence: {(aiInsights.ai_confidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 block">
                      Dense Vector Chunks
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {aiInsights.chunk_count} Chunks Indexed
                    </span>
                    <div className="text-[10px] text-slate-500">
                      768-dim HNSW Cosine Index
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                      Entities Extracted
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {aiInsights.entities.length} Domain Entities
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {aiInsights.entities.filter((e) => e.verified).length} Officer-Verified
                    </div>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Executive Legal Summary
                  </h4>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
                    {aiInsights.summary || "No summary generated for this document."}
                  </div>
                </div>

                {/* Extracted Legal Entities with Officer Verification */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Extracted Named Entities & Identifiers ({aiInsights.entities.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Click checkmark to verify / unverify entity
                    </span>
                  </h4>

                  {aiInsights.entities.length === 0 ? (
                    <p className="text-slate-500 italic text-[11px]">No legal entities detected in text.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {aiInsights.entities.map((ent) => (
                        <div
                          key={ent.id}
                          className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <div className="space-y-0.5 truncate max-w-[200px]">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate" title={ent.entity_value}>
                              {ent.entity_value}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 uppercase">
                              <Badge variant="secondary" className="px-1 py-0 text-[8px]">
                                {ent.entity_type}
                              </Badge>
                              <span>{ent.source}</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={ent.verified ? "default" : "outline"}
                            disabled={verifyingEntityId === ent.id}
                            onClick={() => handleToggleVerifyEntity(activeDocForAI.id, ent.id, ent.verified)}
                            className={`h-6 px-2 text-[10px] flex items-center gap-1 ${
                              ent.verified
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "text-slate-600 border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {verifyingEntityId === ent.id ? (
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            {ent.verified ? "Verified" : "Verify"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Metadata Key-Value Pairs */}
                {aiInsights.metadata_entries && aiInsights.metadata_entries.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      Structured Document Metadata
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-[11px]">
                      <table className="w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-medium text-slate-500">Key</th>
                            <th className="px-3 py-1.5 text-left font-medium text-slate-500">Value</th>
                            <th className="px-3 py-1.5 text-left font-medium text-slate-500">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {aiInsights.metadata_entries.map((m) => (
                            <tr key={m.id}>
                              <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400">{m.key}</td>
                              <td className="px-3 py-1.5 text-slate-900 dark:text-slate-100 font-medium">{m.value}</td>
                              <td className="px-3 py-1.5 text-[10px] text-slate-400 uppercase">{m.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* OCR Text Viewer Toggle (if available) */}
                {aiInsights.ocr_text && (
                  <div className="space-y-1 pt-1">
                    <button
                      onClick={() => setShowOcrText(!showOcrText)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {showOcrText ? "Hide OCR Transcription Preview" : "View OCR Transcription Preview"}
                    </button>
                    {showOcrText && (
                      <div className="p-3 bg-slate-900 text-slate-200 rounded-md font-mono text-[10px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {aiInsights.ocr_text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                AI analysis has not been processed for this document yet.
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setActiveDocForAI(null)}>
                Close Insights
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

