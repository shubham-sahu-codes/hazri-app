import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { saveWorker, useRefreshAll } from "@/lib/data";
import { todayISO } from "@/lib/calc";
import { WORK_TYPES, type Worker } from "@/lib/types";

export function WorkerFormDialog({
  open,
  onOpenChange,
  worker,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  worker?: Worker | null;
}) {
  const { t } = useI18n();
  const refresh = useRefreshAll();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [workType, setWorkType] = useState<string>("Helper");
  const [wage, setWage] = useState("");
  const [otRate, setOtRate] = useState("");
  const [joining, setJoining] = useState(todayISO());
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(worker?.name ?? "");
    setPhone(worker?.phone ?? "");
    setWorkType(worker?.work_type ?? "Helper");
    setWage(worker ? String(Number(worker.daily_wage)) : "");
    setOtRate(worker ? String(Number(worker.overtime_rate)) : "");
    setJoining(worker?.joining_date ?? todayISO());
    setActive((worker?.status ?? "active") === "active");
  }, [open, worker]);

  async function onSubmit() {
    if (!name.trim()) {
      toast.error(t("err_name"));
      return;
    }
    const wageNum = Number(wage);
    if (!wage || Number.isNaN(wageNum) || wageNum <= 0) {
      toast.error(t("err_wage"));
      return;
    }
    setSaving(true);
    try {
      await saveWorker({
        ...(worker ? { id: worker.id } : {}),
        name: name.trim(),
        phone: phone.trim() || null,
        work_type: workType,
        daily_wage: wageNum,
        overtime_rate: Number(otRate) || 0,
        joining_date: joining,
        status: active ? "active" : "inactive",
      });
      refresh();
      toast.success(worker ? t("worker_updated") : t("worker_added"));
      onOpenChange(false);
    } catch {
      toast.error(t("err_generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {worker ? t("edit_worker") : t("add_worker")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="w-name">{t("name")} *</Label>
            <Input
              id="w-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="w-phone">{t("mobile")}</Label>
            <Input
              id="w-phone"
              value={phone}
              inputMode="tel"
              maxLength={15}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("work_type")}</Label>
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="w-wage">{t("daily_wage")} *</Label>
              <Input
                id="w-wage"
                value={wage}
                inputMode="numeric"
                onChange={(e) => setWage(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-12"
                placeholder="800"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-ot">{t("overtime_rate")}</Label>
              <Input
                id="w-ot"
                value={otRate}
                inputMode="numeric"
                onChange={(e) => setOtRate(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-12"
                placeholder="100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="w-join">{t("joining_date")}</Label>
            <Input
              id="w-join"
              type="date"
              value={joining}
              onChange={(e) => setJoining(e.target.value)}
              className="h-12"
            />
          </div>
          {worker && (
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <Label htmlFor="w-active">{t("active")}</Label>
              <Switch id="w-active" checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            className="h-12 w-full text-base"
            onClick={() => void onSubmit()}
            disabled={saving}
          >
            {t("save_worker")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}