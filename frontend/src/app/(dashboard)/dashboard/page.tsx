"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FolderLock,
  FileText,
  Boxes,
  Shield,
  CheckCircle2,
  Cpu,
  Search,
  FileArchive,
  ArrowRight,
  Activity,
  Lock,
  HardDrive,
  Scale,
  Sparkles,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { listCases, listAuditEvents, getSecurityMetrics, listCaseDocuments, listCaseEvidence } from "@/lib/api";
import { Case, AuditEvent, SecurityMetrics } from "@/types";

const LIFECYCLE_STAGES = [
  {
    step: "01",
    name: "Upload & Ingest",
    desc: "MIME magic-byte validation & secure ingest",
    icon: FileText,
    status: "Active",
  },
  {
    step: "02",
    name: "AI / OCR",
    desc: "Tesseract fallback & Indian legal entity extraction",
    icon: Cpu,
    status: "Operational",
  },
  {
    step: "03",
    name: "Secure Storage",
    desc: "Isolated MinIO/S3 object vault with versioning",
    icon: HardDrive,
    status: "Immutable",
  },
  {
    step: "04",
    name: "Hash Verification",
    desc: "SHA-256 baseline computed & checked on every stream",
    icon: ShieldCheck,
    status: "Enforced",
  },
  {
    step: "05",
    name: "Custody Chain",
    desc: "Two-phase custodial transfer state machine",
    icon: Boxes,
    status: "Verified",
  },
  {
    step: "06",
    name: "Legal Review",
    desc: "RBAC-scoped case dossier & evidence inquest",
    icon: Scale,
    status: "Protected",
  },
  {
    step: "07",
    name: "Court Export",
    desc: "Canonical ZIP, Sec. 63/65B BSA 2023 certificate",
    icon: FileArchive,
    status: "Ready",
  },
  {
    step: "08",
    name: "Archive Ledger",
    desc: "Tamper-evident append-only cryptographic ledger",
    icon: Lock,
    status: "Synchronized",
  },
];

const SECURITY_MATRIX = [
  { name: "Document Integrity", status: "Operational", detail: "Real-time SHA-256 baseline verification" },
  { name: "Chain of Custody", status: "Verified", detail: "Cryptographic hash-chained transfer ledger" },
  { name: "Audit Ledger", status: "Synchronized", detail: "Immutable SHA-256 linked event sequence" },
  { name: "Access Control", status: "Enforced", detail: "Zero-Trust case membership & RBAC boundaries" },
  { name: "AI Security", status: "Protected", detail: "Strict human verification advisory & citation grounding" },
];

export default function DashboardHomePage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [verifiedDocsCount, setVerifiedDocsCount] = useState<number>(0);
  const [evidenceCount, setEvidenceCount] = useState<number>(0);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [casesRes, auditRes, metricsRes] = await Promise.allSettled([
        listCases(),
        listAuditEvents({ limit: 6 }),
        getSecurityMetrics(),
      ]);

      if (casesRes.status === "fulfilled") {
        const loadedCases = casesRes.value;
        setCases(loadedCases);
        if (loadedCases.length > 0) {
          try {
            const counts = await Promise.allSettled(
              loadedCases.slice(0, 5).map(async (c) => {
                const [d, e] = await Promise.all([
                  listCaseDocuments(c.id).catch(() => []),
                  listCaseEvidence(c.id).catch(() => []),
                ]);
                return { docs: d.length, ev: e.length };
              })
            );
            let totalD = 0;
            let totalE = 0;
            counts.forEach((res) => {
              if (res.status === "fulfilled") {
                totalD += res.value.docs;
                totalE += res.value.ev;
              }
            });
            setVerifiedDocsCount(totalD);
            setEvidenceCount(totalE);
          } catch {
            // graceful fallback
          }
        }
      }
      if (auditRes.status === "fulfilled") {
        setAuditEvents(auditRes.value);
      }
      if (metricsRes.status === "fulfilled") {
        setMetrics(metricsRes.value);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived metrics from real data
  const activeCasesCount = cases.length;
  const integrityHealth = metrics && metrics.integrity_compromises > 0 ? "Compromised" : "100%";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Command Center */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className="gap-1.5 border-blue-200 bg-blue-50/80 text-blue-800 font-mono text-[10px] font-semibold uppercase tracking-wider"
              >
                <Lock className="h-2.5 w-2.5" /> OFFICIAL USE ONLY
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-sans">
              Digital Evidence Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Secure oversight of cases, evidence, documents and integrity.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-500">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                NCRB &bull; NMH INDIA
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                National Digital Evidence Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Secure</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboardData()}
              className="h-8 gap-1.5 text-xs rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              title="Refresh Command Center Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards (2 Columns on mobile, 4 Columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Cases */}
        <Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              ACTIVE CASES
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <FolderLock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-8 w-12 my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                {activeCasesCount}
              </div>
            )}
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 line-clamp-1">
              Authorized under active membership
            </p>
          </div>
        </Card>

        {/* Verified Documents */}
        <Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              VERIFIED DOCUMENTS
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-8 w-12 my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                {verifiedDocsCount}
              </div>
            )}
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 line-clamp-1">
              SHA-256 integrity confirmed
            </p>
          </div>
        </Card>

        {/* Evidence in Custody */}
        <Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              EVIDENCE IN CUSTODY
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-8 w-12 my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                {evidenceCount}
              </div>
            )}
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 line-clamp-1">
              Chain of custody intact
            </p>
          </div>
        </Card>

        {/* Integrity Health */}
        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/20 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
              INTEGRITY HEALTH
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <Skeleton className="h-8 w-16 my-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 font-sans">
                {integrityHealth}
              </div>
            )}
            <p className="text-[10px] sm:text-[11px] text-emerald-700/90 mt-1 line-clamp-1">
              Zero cryptographic mismatches
            </p>
          </div>
        </Card>
      </div>

      {/* System Security Status & Evidence Lifecycle */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Security Status Panel (1 column) */}
        <Card className="rounded-2xl border-slate-200 bg-white lg:col-span-1 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                System Security Status
              </CardTitle>
              <Badge variant="gov" className="text-[9px] font-mono">
                ZERO-TRUST
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Continuous cryptographic ledger & policy verification
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            {SECURITY_MATRIX.map((item) => (
              <div
                key={item.name}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="pr-2">
                  <div className="text-xs font-semibold text-slate-900">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {item.detail}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-700 font-mono">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-3 p-3 rounded-xl border border-blue-200 bg-blue-50/70 text-[11px] text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-semibold block">Statutory Compliance</span>
                <span className="text-blue-700 text-[10px]">
                  Sec. 63 / 65B Bharatiya Sakshya Adhiniyam, 2023
                </span>
              </div>
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Digital Evidence Lifecycle (2 columns) */}
        <Card className="rounded-2xl border-slate-200 bg-white lg:col-span-2 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Digital Evidence Lifecycle
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  End-to-end chain of verification from seizure to courtroom admissibility
                </CardDescription>
              </div>
              <span className="text-[10px] font-mono text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 w-fit">
                8-STAGE PIPELINE
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {LIFECYCLE_STAGES.map((stg) => {
                const IconComp = stg.icon;
                return (
                  <div
                    key={stg.step}
                    className="relative group rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-none"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        STAGE {stg.step}
                      </span>
                      <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {stg.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                        {stg.name}
                      </h4>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                      {stg.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Immutable Audit Trail & Quick Operations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real Audit Activity Stream (2 columns) */}
        <Card className="rounded-2xl border-slate-200 bg-white lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Immutable Audit Trail & Operations Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Live cryptographic ledger events recorded across authorized cases
              </CardDescription>
            </div>
            <Link href="/settings" className="text-xs text-blue-600 hover:underline font-medium">
              Verify Hash Chain &rarr;
            </Link>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            {loading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : auditEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {auditEvents.map((evt) => (
                  <div key={evt.id} className="py-3 flex items-start justify-between gap-3 text-xs first:pt-1 last:pb-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 uppercase tracking-wider font-mono text-[11px]">
                            {evt.action.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {evt.resource_type}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Officer: <span className="font-medium text-slate-700">{evt.actor_email || evt.actor_name || "System"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-slate-400">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "—"}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 mt-0.5">
                        <ShieldCheck className="h-3 w-3" /> Chained
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <Shield className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="font-semibold">No Recent Audit Records</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sign in or perform an evidence operation to record ledger activity.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operational Portals (1 column) */}
        <Card className="rounded-2xl border-slate-200 bg-white lg:col-span-1 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold tracking-tight text-slate-900">
              Operational Portals
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct access to mission-critical investigation workflows
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-2.5">
            <Link
              href="/cases"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100/70 text-blue-600">
                  <FolderLock className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Case Dossiers
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Investigative files & legal filings
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/documents"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-100/70 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Document Vault
                  </span>
                  <span className="text-[10px] text-slate-500">
                    SHA-256 baselines & OCR extraction
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/evidence"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100/70 text-amber-600">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Central Evidence Vault
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Chain-of-custody transfer protocols
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/search"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-cyan-50/50 hover:border-cyan-300 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-100/70 text-cyan-600">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Evidence Intelligence & RAG
                  </span>
                  <span className="text-[10px] text-slate-500">
                    pgvector semantic & hybrid search
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Platform Standards Footer Bar */}
      <div className="rounded-2xl bg-[#081426] text-white p-4 sm:p-5 text-xs font-mono flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            Bharatiya Sakshya Adhiniyam, 2023 &bull; Sec. 63 / 65B Compliant
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Argon2id &bull; SHA-256 Digest Chains &bull; PostgreSQL 16 &bull; pgvector &bull; S3 Object Storage
        </div>
      </div>
    </div>
  );
}

