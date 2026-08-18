import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, LogOut, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import {
  saveBusiness,
  useAttendance,
  useBusiness,
  usePayments,
  useRefreshAll,
  useSubscription,
  useWorkers,
} from "@/lib/data";
import { attendanceFor, fmt, monthRange, paymentsFor, workerTotals } from "@/lib/calc";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({
    meta: [
      { title: "Settings & Monthly Summary — Hazri App" },
      {
        name: "description",
        content: "Business profile, app language, monthly labour summary and data export.",
      },
      { property: "og:title", content: "Settings & Monthly Summary — Hazri App" },
      { property: "og:description", content: "Business profile, language and monthly summary." },
    ],
  }),
  component: MorePage,
});

function MorePage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const business = useBusiness();
  const workers = useWorkers();
  const attendance = useAttendance();
  const payments = usePayments();
  const subscription = useSubscription();
  const refresh = useRefreshAll();
  const [bizName, setBizName] = useState("");
  const [contractor, setContractor] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const { from, to } = monthRange();

  useEffect(() => {
    if (!business.data) return;
    setBizName(business.data.business_name ?? "");
    setContractor(business.data.contractor_name ?? "");
    setPhone(business.data.phone ?? "");
  }, [business.data]);

  const summary = useMemo(() => {
    const att = attendance.data ?? [];
    const pays = payments.data ?? [];
    let cost = 0;
    let paid = 0;
    let advance = 0;
    let pending = 0;
    let days = 0;
    for (const w of workers.data ?? []) {
      const tot = workerTotals(attendanceFor(w, att, from, to), paymentsFor(w.id, pays, from, to));
      cost += tot.gross;
      paid += tot.paid;
      advance += tot.advance;
      pending += tot.pending;
      days += tot.presentDays + tot.halfDays * 0.5;
    }
    return { cost, paid, advance, pending, days };
  }, [workers.data, attendance.data, payments.data, from, to]);

  async function save() {
    if (!bizName.trim()) {
      toast.error(t("err_generic"));
      return;
    }
    setSaving(true);
    try {
      await saveBusiness({
        ...(business.data?.id ? { id: business.data.id } : {}),
        business_name: bizName.trim().slice(0, 80),
        contractor_name: contractor.trim().slice(0, 80) || null,
        phone: phone.trim().slice(0, 20) || null,
      });
      refresh();
      toast.success(t("saved"));
    } catch {
      toast.error(t("err_generic"));
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const names = new Map((workers.data ?? []).map((w) => [w.id, w.name]));
    const lines = [
      "type,worker,date,status_or_method,amount",
      ...(attendance.data ?? []).map((a) =>
        [
          "attendance",
          names.get(a.worker_id) ?? "",
          a.date,
          a.status,
          String(a.daily_earning),
        ].join(","),
      ),
      ...(payments.data ?? []).map((p) =>
        ["payment", names.get(p.worker_id) ?? "", p.date, p.payment_method, String(p.amount)].join(
          ",",
        ),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kaam-saathi-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell title={t("settings")}>
      <Link
        to="/subscription"
        className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <span className="flex items-center gap-2 font-display font-semibold">
          <Sparkles className="size-4 text-primary" /> Subscription
        </span>
        <span className="text-sm text-muted-foreground">
          {subscription.data && new Date(subscription.data.expires_at).getTime() > Date.now()
            ? `${subscription.data.plan === "median" ? "Median" : "Base"} · till ${new Date(
                subscription.data.expires_at,
              ).toLocaleDateString("en-IN")}`
            : "Not active"}
        </span>
      </Link>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">{t("monthly_summary")}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <Row label={t("working_days")} value={String(summary.days)} />
          <Row label={t("total_labour_cost")} value={fmt(summary.cost)} strong />
          <Row label={t("total_paid")} value={fmt(summary.paid)} />
          <Row label={t("total_advances")} value={fmt(summary.advance)} />
          <Row label={t("total_pending")} value={fmt(summary.pending)} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">{t("business_profile")}</h2>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="b-name">{t("business_name")}</Label>
            <Input
              id="b-name"
              className="h-12"
              value={bizName}
              maxLength={80}
              onChange={(e) => setBizName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-contractor">{t("contractor_name")}</Label>
            <Input
              id="b-contractor"
              className="h-12"
              value={contractor}
              maxLength={80}
              onChange={(e) => setContractor(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-phone">{t("mobile")}</Label>
            <Input
              id="b-phone"
              className="h-12"
              inputMode="tel"
              value={phone}
              maxLength={20}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button className="h-12 w-full" disabled={saving} onClick={() => void save()}>
            {t("save")}
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">{t("language")}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`min-h-12 rounded-xl border text-sm font-medium transition-colors ${
                lang === l.code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("currency")}: ₹ (INR)
        </p>
      </section>

      <section className="mt-4 space-y-2">
        <Button variant="soft" className="h-12 w-full" onClick={exportCsv}>
          <Download className="size-4" /> {t("export_data")}
        </Button>
        <Button variant="ghost" className="h-12 w-full" onClick={() => void signOut()}>
          <LogOut className="size-4" /> {t("sign_out")}
        </Button>
      </section>
    </AppShell>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-display font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}