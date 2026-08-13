import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { recordPayment, useRefreshAll } from "@/lib/data";
import { fmt, formatDate, todayISO, type WorkerTotals } from "@/lib/calc";
import type { PaymentMethod, PaymentType, Worker } from "@/lib/types";

const METHODS: PaymentMethod[] = ["cash", "upi", "bank", "other"];

export function PaymentDialog({
  open,
  onOpenChange,
  worker,
  totals,
  mode = "salary",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker: Worker | null;
  totals: WorkerTotals | null;
  mode?: "salary" | "advance";
}) {
  const { t } = useI18n();
  const refresh = useRefreshAll();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<null | {
    amount: number;
    type: PaymentType;
    method: PaymentMethod;
    date: string;
    remaining: number;
  }>(null);

  const pending = totals?.pending ?? 0;

  useEffect(() => {
    if (!open) return;
    setAmount(mode === "advance" ? "" : pending > 0 ? String(Math.round(pending)) : "");
    setMethod("cash");
    setDate(todayISO());
    setNotes("");
    setReceipt(null);
  }, [open, mode, pending]);

  const amountNum = Number(amount) || 0;

  const paymentType: PaymentType = useMemo(() => {
    if (mode === "advance") return "advance";
    if (pending > 0 && amountNum < pending) return "partial_payment";
    return "salary";
  }, [mode, pending, amountNum]);

  const shareText = receipt
    ? [
        `*${t("payment_successful")}*`,
        `${t("worker")}: ${worker?.name ?? ""}`,
        `${t("amount")}: ${fmt(receipt.amount)}`,
        `${t("payment_type")}: ${t(receipt.type)}`,
        `${t("payment_method")}: ${t(receipt.method)}`,
        `${t("date")}: ${formatDate(receipt.date)}`,
        `${t("remaining")}: ${fmt(receipt.remaining)}`,
      ].join("\n")
    : "";

  function validate(): boolean {
    if (!worker) return false;
    if (!amount || amountNum <= 0) {
      toast.error(t("err_amount"));
      return false;
    }
    if (mode === "salary" && amountNum > pending) {
      toast.error(t("err_over_pending"));
      return false;
    }
    return true;
  }

  async function submit() {
    if (!worker) return;
    setSaving(true);
    try {
      await recordPayment({
        worker_id: worker.id,
        amount: amountNum,
        payment_type: paymentType,
        payment_method: method,
        date,
        notes: notes.trim() || null,
      });
      refresh();
      const remaining = Math.max(0, pending - amountNum);
      setReceipt({ amount: amountNum, type: paymentType, method, date, remaining });
      toast.success(
        paymentType === "advance"
          ? t("advance_given")
          : paymentType === "partial_payment"
            ? t("partial_recorded")
            : t("payment_successful"),
      );
    } catch {
      toast.error(t("err_generic"));
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ text: shareText }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      });
      return;
    }
    const phone = worker?.phone?.replace(/\D/g, "");
    const base = phone && phone.length >= 10 ? `https://wa.me/91${phone.slice(-10)}` : "https://wa.me/";
    window.open(`${base}?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  function download() {
    const blob = new Blob([shareText.replaceAll("*", "")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${worker?.name?.replace(/\s+/g, "-") ?? "worker"}-${receipt?.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {receipt ? (
          <div className="space-y-5 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <DialogHeader>
              <DialogTitle className="font-display text-center text-xl">
                {receipt.type === "partial_payment"
                  ? t("partial_recorded")
                  : t("payment_successful")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 rounded-2xl border border-border bg-secondary/50 p-4 text-left text-sm">
              <Row label={t("worker")} value={worker?.name ?? ""} />
              <Row label={t("amount")} value={fmt(receipt.amount)} strong />
              <Row label={t("payment_type")} value={t(receipt.type)} />
              <Row label={t("payment_method")} value={t(receipt.method)} />
              <Row label={t("date")} value={formatDate(receipt.date)} />
              <Row label={t("remaining")} value={fmt(receipt.remaining)} />
            </div>
            <div className="grid gap-2">
              <Button className="h-12" variant="success" onClick={share}>
                <Share2 className="size-4" /> {t("share_whatsapp")}
              </Button>
              <Button className="h-12" variant="outline" onClick={download}>
                <Download className="size-4" /> {t("download_receipt")}
              </Button>
              <Button className="h-12" variant="ghost" onClick={() => onOpenChange(false)}>
                {t("done")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                {mode === "advance" ? t("give_advance") : t("pay_worker")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <p className="font-display text-lg font-semibold">{worker?.name}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <Row label={t("total_earnings")} value={fmt(totals?.gross ?? 0)} />
                  <Row label={t("advance")} value={fmt(totals?.advance ?? 0)} />
                  <Row label={t("already_paid")} value={fmt(totals?.paid ?? 0)} />
                  <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">{t("amount_due")}</span>
                    <span className="font-display text-xl font-bold text-warning">
                      {fmt(pending)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-amt">{t("payment_amount")}</Label>
                <Input
                  id="p-amt"
                  value={amount}
                  inputMode="numeric"
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  className="h-14 font-display text-xl"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("payment_method")}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`min-h-11 rounded-xl border text-sm font-medium transition-colors ${
                        method === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {t(m)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-date">{t("date")}</Label>
                <Input
                  id="p-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-notes">{t("notes")}</Label>
                <Textarea
                  id="p-notes"
                  value={notes}
                  maxLength={200}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                className="h-14 w-full text-base"
                variant="success"
                disabled={saving}
                onClick={() => {
                  if (validate()) setConfirming(true);
                }}
              >
                {mode === "advance" ? t("give_advance") : t("confirm_payment")}
              </Button>
            </div>
          </>
        )}

        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">
                {t("confirm_payment")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirm_pay_q", { amount: fmt(amountNum), name: worker?.name ?? "" })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void submit()}>
                {t("confirm_payment")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
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