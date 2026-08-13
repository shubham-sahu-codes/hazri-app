import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { WorkerFormDialog } from "@/components/WorkerFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useAttendance, usePayments, useWorkers } from "@/lib/data";
import { attendanceFor, fmt, monthRange, paymentsFor, workerTotals } from "@/lib/calc";
import { Onboarding } from "@/components/Onboarding";

export const Route = createFileRoute("/_authenticated/workers/")({
  head: () => ({
    meta: [
      { title: "Workers — Kaam Saathi" },
      {
        name: "description",
        content: "Your worker list with daily wage, this month's days worked and pending dues.",
      },
      { property: "og:title", content: "Workers — Kaam Saathi" },
      { property: "og:description", content: "Manage workers, wages and pending dues." },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const { t } = useI18n();
  const workers = useWorkers();
  const attendance = useAttendance();
  const payments = usePayments();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active");
  const [addOpen, setAddOpen] = useState(false);
  const { from, to } = monthRange();

  const rows = useMemo(() => {
    const att = attendance.data ?? [];
    const pays = payments.data ?? [];
    return (workers.data ?? [])
      .filter((w) => (filter === "all" ? true : w.status === filter))
      .filter((w) => w.name.toLowerCase().includes(q.trim().toLowerCase()))
      .map((w) => ({
        worker: w,
        totals: workerTotals(attendanceFor(w, att, from, to), paymentsFor(w.id, pays, from, to)),
      }));
  }, [workers.data, attendance.data, payments.data, filter, q, from, to]);

  if (workers.isLoading) {
    return (
      <AppShell title={t("workers")}>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if ((workers.data ?? []).length === 0) {
    return (
      <AppShell title={t("workers")}>
        <Onboarding />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t("workers")}
      subtitle={`${(workers.data ?? []).filter((w) => w.status === "active").length} ${t("active")}`}
      action={
        <Button size="icon" className="size-11" onClick={() => setAddOpen(true)}>
          <Plus className="size-5" />
        </Button>
      }
    >
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search_workers")}
          className="h-12 pl-9"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["active", "inactive", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-11 rounded-xl border text-sm font-medium transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {t(f)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {t("no_workers")}
          </p>
        )}
        {rows.map(({ worker, totals }) => (
          <Link
            key={worker.id}
            to="/workers/$id"
            params={{ id: worker.id }}
            className="block rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-semibold">{worker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {worker.work_type} · {fmt(Number(worker.daily_wage))}
                  {t("per_day")}
                </p>
              </div>
              {worker.status === "inactive" && (
                <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {t("inactive")}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
              <span className="text-muted-foreground">
                {t("days_present")}:{" "}
                <span className="font-display font-semibold text-foreground">
                  {totals.presentDays + totals.halfDays * 0.5}
                </span>
              </span>
              <span className="text-muted-foreground">
                {t("total_earnings")}:{" "}
                <span className="font-display font-semibold text-foreground">
                  {fmt(totals.gross)}
                </span>
              </span>
              <span className="text-muted-foreground">
                {t("pending")}:{" "}
                <span className="font-display font-semibold text-warning">
                  {fmt(totals.pending)}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <WorkerFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}