import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertCircle, ClipboardCheck, HardHat, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { WorkerFormDialog } from "@/components/WorkerFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useAttendance, usePayments, useWorkers } from "@/lib/data";
import {
  attendanceFor,
  fmt,
  formatDate,
  monthRange,
  todayISO,
  workerTotals,
  type WorkerTotals,
} from "@/lib/calc";
import type { Worker } from "@/lib/types";
import { Onboarding } from "@/components/Onboarding";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Today's Overview — Kaam Saathi" },
      {
        name: "description",
        content: "Today's attendance, labour cost, payments made and pending worker dues.",
      },
      { property: "og:title", content: "Today's Overview — Kaam Saathi" },
      { property: "og:description", content: "Attendance, labour cost and pending payments." },
    ],
  }),
  component: HomePage,
});

function greetKey() {
  const h = new Date().getHours();
  if (h < 12) return "good_morning" as const;
  if (h < 17) return "good_afternoon" as const;
  return "good_evening" as const;
}

function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const workers = useWorkers();
  const attendance = useAttendance();
  const payments = usePayments();
  const [addOpen, setAddOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<{ worker: Worker; totals: WorkerTotals } | null>(null);

  const loading = workers.isLoading || attendance.isLoading || payments.isLoading;
  const today = todayISO();
  const { from, to } = monthRange();

  const data = useMemo(() => {
    const ws = (workers.data ?? []).filter((w) => w.status === "active");
    const att = attendance.data ?? [];
    const pays = payments.data ?? [];
    const todayAtt = att.filter((a) => a.date === today);
    const counts = { present: 0, half_day: 0, absent: 0, leave: 0 };
    let labourCost = 0;
    for (const a of todayAtt) {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
      labourCost += Number(a.daily_earning);
    }
    const paidToday = pays
      .filter((p) => p.date === today)
      .reduce((s, p) => s + Number(p.amount), 0);

    const pendingList = (workers.data ?? [])
      .map((w) => ({
        worker: w,
        totals: workerTotals(attendanceFor(w, att, from, to), 
          pays.filter((p) => p.worker_id === w.id && p.date >= from && p.date <= to)),
      }))
      .filter((r) => r.totals.pending > 0)
      .sort((a, b) => b.totals.pending - a.totals.pending);

    return {
      activeCount: ws.length,
      counts,
      labourCost,
      paidToday,
      marked: todayAtt.length,
      unmarked: Math.max(0, ws.length - todayAtt.filter((a) => ws.some((w) => w.id === a.worker_id)).length),
      pendingList,
      pendingTotal: pendingList.reduce((s, r) => s + r.totals.pending, 0),
    };
  }, [workers.data, attendance.data, payments.data, today, from, to]);

  if (loading) {
    return (
      <AppShell title={t("todays_overview")}>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if ((workers.data ?? []).length === 0) {
    return (
      <AppShell>
        <Onboarding />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`${t(greetKey())} 👋`}
      subtitle={formatDate(today, { weekday: "long" })}
    >
      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase">
          {t("todays_overview")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label={t("workers_present")}
            value={`${data.counts.present + data.counts.half_day} / ${data.activeCount}`}
          />
          <Stat label={t("todays_labour_cost")} value={fmt(data.labourCost)} />
          <Stat label={t("paid_today")} value={fmt(data.paidToday)} tone="success" />
          <Stat label={t("pending_payments")} value={fmt(data.pendingTotal)} tone="warning" />
        </div>
      </section>

      {(data.unmarked > 0 || data.pendingTotal > 0) && (
        <section className="mt-4 space-y-2">
          {data.unmarked > 0 && (
            <Notice text={t("reminder_unmarked", { count: data.unmarked })} />
          )}
          {data.pendingTotal > 0 && (
            <Notice text={t("reminder_pending", { amount: fmt(data.pendingTotal) })} />
          )}
        </section>
      )}

      <section className="mt-6 space-y-3">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase">
          {t("quick_actions")}
        </h2>
        <div className="grid gap-3">
          <Button
            className="h-16 justify-start gap-3 text-base"
            onClick={() => void navigate({ to: "/attendance" })}
          >
            <ClipboardCheck className="size-5" /> {t("mark_attendance")}
          </Button>
          <Button
            variant="success"
            className="h-16 justify-start gap-3 text-base"
            onClick={() => void navigate({ to: "/payments" })}
          >
            <Wallet className="size-5" /> {t("pay_worker")}
          </Button>
          <Button
            variant="soft"
            className="h-16 justify-start gap-3 text-base"
            onClick={() => setAddOpen(true)}
          >
            <HardHat className="size-5" /> {t("add_worker")}
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card">
        <h2 className="font-display font-semibold">{t("todays_attendance")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <Line label={t("present")} value={data.counts.present} />
          <Line label={t("half_day")} value={data.counts.half_day} />
          <Line label={t("absent")} value={data.counts.absent} />
          <Line label={t("leave")} value={data.counts.leave} />
          <Line label={t("total_workers")} value={data.activeCount} />
        </div>
        <Button asChild variant="outline" className="mt-4 h-12 w-full">
          <Link to="/attendance">{t("view_attendance")}</Link>
        </Button>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase">
          {t("pending_payments")}
        </h2>
        <div className="mt-3 space-y-2">
          {data.pendingList.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              {t("no_pending")}
            </p>
          )}
          {data.pendingList.slice(0, 5).map(({ worker, totals }) => (
            <div
              key={worker.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div>
                <p className="font-medium">{worker.name}</p>
                <p className="text-sm font-semibold text-warning">
                  {fmt(totals.pending)} {t("pending")}
                </p>
              </div>
              <Button
                variant="success"
                className="h-11 px-5"
                onClick={() => setPayTarget({ worker, totals })}
              >
                {t("pay_now")}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <WorkerFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <PaymentDialog
        open={payTarget !== null}
        onOpenChange={(v) => !v && setPayTarget(null)}
        worker={payTarget?.worker ?? null}
        totals={payTarget?.totals ?? null}
      />
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const color =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-display font-semibold">{value}</span>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-warning-soft p-3 text-sm text-warning-foreground">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
      <span className="text-foreground">{text}</span>
    </div>
  );
}