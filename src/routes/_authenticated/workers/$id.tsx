import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Phone, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { WorkerFormDialog } from "@/components/WorkerFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import {
  deleteWorker,
  setWorkerStatus,
  useAttendance,
  usePayments,
  useRefreshAll,
  useWorkers,
} from "@/lib/data";
import { attendanceFor, fmt, formatDate, monthRange, paymentsFor, workerTotals } from "@/lib/calc";

export const Route = createFileRoute("/_authenticated/workers/$id")({
  head: () => ({
    meta: [
      { title: "Worker Details — Kaam Saathi" },
      {
        name: "description",
        content: "Worker profile with attendance history, earnings, advances and payment history.",
      },
      { property: "og:title", content: "Worker Details — Kaam Saathi" },
      { property: "og:description", content: "Attendance, earnings and payments for one worker." },
    ],
  }),
  component: WorkerDetail,
});

function WorkerDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const workers = useWorkers();
  const attendance = useAttendance();
  const payments = usePayments();
  const refresh = useRefreshAll();
  const [tab, setTab] = useState<"attendance" | "payments">("attendance");
  const [editOpen, setEditOpen] = useState(false);
  const [payMode, setPayMode] = useState<null | "salary" | "advance">(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { from, to } = monthRange();

  const worker = (workers.data ?? []).find((w) => w.id === id) ?? null;

  const { totals, att, pays } = useMemo(() => {
    if (!worker) return { totals: null, att: [], pays: [] };
    const a = attendanceFor(worker, attendance.data ?? [], from, to);
    const p = paymentsFor(worker.id, payments.data ?? [], from, to);
    return { totals: workerTotals(a, p), att: a, pays: p };
  }, [worker, attendance.data, payments.data, from, to]);

  if (workers.isLoading || !worker || !totals) {
    return (
      <AppShell title={t("workers")}>
        <Skeleton className="h-40 rounded-2xl" />
      </AppShell>
    );
  }

  async function toggleStatus() {
    if (!worker) return;
    try {
      await setWorkerStatus(worker.id, worker.status === "active" ? "inactive" : "active");
      refresh();
      toast.success(t("saved"));
    } catch {
      toast.error(t("err_generic"));
    }
  }

  async function handleDelete() {
    if (!worker) return;
    setDeleting(true);
    try {
      await deleteWorker(worker.id);
      refresh();
      toast.success(t("worker_deleted"));
      void navigate({ to: "/workers" });
    } catch {
      toast.error(t("err_generic"));
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/workers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> {t("workers")}
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h1 className="font-display text-2xl font-bold tracking-tight">{worker.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {worker.work_type} · {fmt(Number(worker.daily_wage))}
          {t("per_day")} · {fmt(Number(worker.overtime_rate))}
          {t("per_hour")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("joining_date")}: {formatDate(worker.joining_date)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {worker.phone && (
            <Button asChild variant="outline" className="h-11">
              <a href={`tel:${worker.phone}`}>
                <Phone className="size-4" /> {worker.phone}
              </a>
            </Button>
          )}
          <Button variant="ghost" className="h-11" onClick={() => void toggleStatus()}>
            {worker.status === "active" ? t("delete_worker") : t("active")}
          </Button>
          <Button
            variant="ghost"
            className="h-11 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" /> {t("delete_worker_permanently")}
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {t("delete_worker_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_worker_desc", { name: worker.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {t("delete_worker_permanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-xs font-semibold text-muted-foreground uppercase">{t("this_month")}</p>
        <div className="mt-3 space-y-2 text-sm">
          <Row label={t("present")} value={String(totals.presentDays)} />
          <Row label={t("half_day")} value={String(totals.halfDays)} />
          <Row label={t("absent")} value={String(totals.absentDays)} />
          <Row label={t("base_earnings")} value={fmt(totals.baseEarnings)} />
          <Row label={t("overtime")} value={fmt(totals.overtime)} />
          <Row label={t("gross_earnings")} value={fmt(totals.gross)} strong />
          <Row label={t("advances")} value={`- ${fmt(totals.advance)}`} />
          <Row label={t("paid")} value={`- ${fmt(totals.paid)}`} />
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">{t("amount_due")}</span>
            <span className="font-display text-2xl font-bold text-warning">
              {fmt(totals.pending)}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="success" className="h-12" onClick={() => setPayMode("salary")}>
            {t("pay_now")}
          </Button>
          <Button variant="soft" className="h-12" onClick={() => setPayMode("advance")}>
            {t("give_advance")}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {(["attendance", "payments"] as const).map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => setTab(tk)}
            className={`min-h-11 rounded-xl border text-sm font-medium transition-colors ${
              tab === tk
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {tk === "attendance" ? t("attendance_history") : t("payment_history")}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {tab === "attendance"
          ? att.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm shadow-card"
              >
                <div>
                  <p className="font-medium">{formatDate(a.date, { weekday: "short" })}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(a.status)}
                    {Number(a.overtime_hours) > 0 && ` · ${a.overtime_hours}h ${t("overtime")}`}
                  </p>
                </div>
                <span className="font-display font-semibold">{fmt(Number(a.daily_earning))}</span>
              </div>
            ))
          : pays.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm shadow-card"
              >
                <div>
                  <p className="font-medium">{t(p.payment_type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.date)} · {t(p.payment_method)}
                  </p>
                </div>
                <span className="font-display font-semibold text-success">
                  {fmt(Number(p.amount))}
                </span>
              </div>
            ))}
        {(tab === "attendance" ? att.length : pays.length) === 0 && (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {tab === "attendance" ? t("not_marked") : t("no_payments")}
          </p>
        )}
      </div>

      <WorkerFormDialog open={editOpen} onOpenChange={setEditOpen} worker={worker} />
      <PaymentDialog
        open={payMode !== null}
        onOpenChange={(v) => !v && setPayMode(null)}
        worker={worker}
        totals={totals}
        mode={payMode ?? "salary"}
      />
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