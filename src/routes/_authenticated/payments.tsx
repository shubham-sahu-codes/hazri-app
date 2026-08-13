import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useAttendance, usePayments, useWorkers } from "@/lib/data";
import {
  attendanceFor,
  fmt,
  formatDate,
  monthRange,
  paymentsFor,
  workerTotals,
  type WorkerTotals,
} from "@/lib/calc";
import type { Worker } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Kaam Saathi" },
      {
        name: "description",
        content: "Pending worker dues and full payment history with receipts you can share.",
      },
      { property: "og:title", content: "Payments — Kaam Saathi" },
      { property: "og:description", content: "Settle wages, advances and share receipts." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { t } = useI18n();
  const workers = useWorkers();
  const attendance = useAttendance();
  const payments = usePayments();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [target, setTarget] = useState<{
    worker: Worker;
    totals: WorkerTotals;
    mode: "salary" | "advance";
  } | null>(null);
  const { from, to } = monthRange();

  const rows = useMemo(() => {
    const att = attendance.data ?? [];
    const pays = payments.data ?? [];
    return (workers.data ?? []).map((w) => ({
      worker: w,
      totals: workerTotals(attendanceFor(w, att, from, to), paymentsFor(w.id, pays, from, to)),
    }));
  }, [workers.data, attendance.data, payments.data, from, to]);

  const history = useMemo(() => {
    const names = new Map((workers.data ?? []).map((w) => [w.id, w.name]));
    return (payments.data ?? []).map((p) => ({ ...p, name: names.get(p.worker_id) ?? "" }));
  }, [payments.data, workers.data]);

  const pendingRows = rows.filter((r) => r.totals.pending > 0);
  const totalPending = pendingRows.reduce((s, r) => s + r.totals.pending, 0);

  if (workers.isLoading || payments.isLoading) {
    return (
      <AppShell title={t("payments")}>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("payments")} subtitle={`${t("total_pending")}: ${fmt(totalPending)}`}>
      <div className="grid grid-cols-2 gap-2">
        {(["pending", "history"] as const).map((tk) => (
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
            {tk === "pending" ? t("pending_payments") : t("payment_history")}
          </button>
        ))}
      </div>

      {tab === "pending" ? (
        <div className="mt-4 space-y-3">
          {rows.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {t("no_workers")}
            </p>
          )}
          {rows.length > 0 && pendingRows.length === 0 && (
            <p className="rounded-2xl bg-success-soft p-5 text-sm font-medium text-foreground">
              {t("no_pending")}
            </p>
          )}
          {rows
            .filter((r) => r.worker.status === "active" || r.totals.pending > 0)
            .map(({ worker, totals }) => (
              <div
                key={worker.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("total_earnings")}: {fmt(totals.gross)} · {t("paid")}:{" "}
                      {fmt(totals.totalGiven)}
                    </p>
                  </div>
                  <span className="font-display text-lg font-bold text-warning">
                    {fmt(totals.pending)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="success"
                    className="h-12"
                    disabled={totals.pending <= 0}
                    onClick={() => setTarget({ worker, totals, mode: "salary" })}
                  >
                    <Wallet className="size-4" /> {t("pay_now")}
                  </Button>
                  <Button
                    variant="soft"
                    className="h-12"
                    onClick={() => setTarget({ worker, totals, mode: "advance" })}
                  >
                    {t("give_advance")}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {history.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {t("no_payments")}
            </p>
          )}
          {history.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t(p.payment_type)} · {formatDate(p.date)} · {t(p.payment_method)}
                </p>
              </div>
              <span className="font-display font-semibold text-success">
                {fmt(Number(p.amount))}
              </span>
            </div>
          ))}
        </div>
      )}

      <PaymentDialog
        open={target !== null}
        onOpenChange={(v) => !v && setTarget(null)}
        worker={target?.worker ?? null}
        totals={target?.totals ?? null}
        mode={target?.mode ?? "salary"}
      />
    </AppShell>
  );
}