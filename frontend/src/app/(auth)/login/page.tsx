"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Lock, ArrowRight, AlertCircle, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed. Please verify your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#081426] flex flex-col justify-between p-4 sm:p-6 text-white relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Prominent Ambient Watermark Background Graphic */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-[0.16] pointer-events-none filter drop-shadow-2xl scale-110"
        style={{ backgroundImage: "url('/images/docshield-bg.png')" }}
      />
      {/* Ambient Gradient Highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Official Tag */}
      <div className="w-full flex items-center justify-between max-w-md mx-auto pt-2 z-10">
        <Badge
          variant="outline"
          className="gap-1.5 border-blue-800/80 bg-blue-950/80 text-blue-300 font-mono text-[10px] uppercase font-semibold"
        >
          <Lock className="h-2.5 w-2.5" /> OFFICIAL USE ONLY
        </Badge>
        <span className="text-[10px] font-mono text-slate-400">SEC-65B BSA</span>
      </div>

      {/* Main Center Auth Container */}
      <div className="w-full max-w-sm mx-auto my-auto py-6 z-10">
        {/* Logo & Brand Header - Shield Aligned Above DOCS SHIELD */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <div className="relative h-24 w-24 drop-shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/docshield-shield.png"
                alt="DocShield Emblem"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase font-sans drop-shadow-sm">
            DOCS SHIELD
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Secure Evidence. Trusted Records.
          </p>
          <p className="text-[11px] text-blue-400 font-mono tracking-wide mt-0.5">
            Fast. Auditable.
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className="border-slate-800/90 bg-[#0B1930] text-white shadow-2xl rounded-2xl">
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Official Gov Email
                </label>
                <Input
                  type="email"
                  placeholder="officer@ncrb.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-700/80 bg-slate-900/90 text-white placeholder:text-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-slate-700/80 bg-slate-900/90 text-white placeholder:text-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold gap-2 mt-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authenticating Session...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* System Secure Pill Button */}
            <div className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Secure</span>
              <Shield className="h-3.5 w-3.5 ml-auto text-emerald-400" />
            </div>

            {/* Quick 1-Click Role Login for Evaluators */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-mono text-[11px]">1-Click Demo Access:</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Instant Sign-In</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    fillCredentials("admin@ncrb.gov.in", "Admin@DocShield2026!");
                    setIsSubmitting(true);
                    try {
                      await login({ email: "admin@ncrb.gov.in", password: "Admin@DocShield2026!" });
                    } catch (e: any) {
                      setError(e?.message || "Sign in failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/80 p-2 text-left text-[11px] text-slate-200 hover:bg-slate-700/90 hover:border-amber-500 transition shadow-sm group"
                >
                  <div className="font-semibold text-amber-400 flex items-center justify-between">
                    <span>System Admin</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">admin@ncrb.gov.in</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    fillCredentials("officer@ncrb.gov.in", "Investigator@2026!");
                    setIsSubmitting(true);
                    try {
                      await login({ email: "officer@ncrb.gov.in", password: "Investigator@2026!" });
                    } catch (e: any) {
                      setError(e?.message || "Sign in failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/80 p-2 text-left text-[11px] text-slate-200 hover:bg-slate-700/90 hover:border-blue-500 transition shadow-sm group"
                >
                  <div className="font-semibold text-blue-400 flex items-center justify-between">
                    <span>Investigator</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">officer@ncrb.gov.in</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    fillCredentials("forensic@ncrb.gov.in", "ForensicExpert@2026!");
                    setIsSubmitting(true);
                    try {
                      await login({ email: "forensic@ncrb.gov.in", password: "ForensicExpert@2026!" });
                    } catch (e: any) {
                      setError(e?.message || "Sign in failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/80 p-2 text-left text-[11px] text-slate-200 hover:bg-slate-700/90 hover:border-purple-500 transition shadow-sm group"
                >
                  <div className="font-semibold text-purple-400 flex items-center justify-between">
                    <span>Forensics</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">forensic@ncrb.gov.in</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    fillCredentials("prosecutor@ncrb.gov.in", "Prosecutor@2026!");
                    setIsSubmitting(true);
                    try {
                      await login({ email: "prosecutor@ncrb.gov.in", password: "Prosecutor@2026!" });
                    } catch (e: any) {
                      setError(e?.message || "Sign in failed");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/80 p-2 text-left text-[11px] text-slate-200 hover:bg-slate-700/90 hover:border-emerald-500 transition shadow-sm group"
                >
                  <div className="font-semibold text-emerald-400 flex items-center justify-between">
                    <span>Prosecutor</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">prosecutor@ncrb.gov.in</div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center pb-4 z-10">
        <p className="text-xs font-semibold text-slate-400 tracking-wider font-sans uppercase">
          NCIB &bull; NMH INDIA
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          National Digital Evidence Platform
        </p>
      </div>
    </div>
  );
}

