import { useState } from "react";
import { toast } from "sonner";
import { HardHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerFormDialog } from "@/components/WorkerFormDialog";
import { useI18n } from "@/lib/i18n";
import { useRefreshAll } from "@/lib/data";
import { loadDemoData } from "@/lib/demo";

export function Onboarding() {
  const { t } = useI18n();
  const refresh = useRefreshAll();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function demo() {
    setBusy(true);
    try {
      await loadDemoData();
      refresh();
      toast.success(t("demo_loaded"));
    } catch {
      toast.error(t("err_generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
        <HardHat className="size-6 text-primary" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">{t("setup_title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("setup_desc")}</p>
      <div className="mt-6 space-y-3">
        <Button className="h-14 w-full text-base" onClick={() => setOpen(true)}>
          {t("add_first_worker")}
        </Button>
        <Button
          variant="soft"
          className="h-12 w-full"
          disabled={busy}
          onClick={() => void demo()}
        >
          <Sparkles className="size-4" /> {t("load_demo")}
        </Button>
      </div>
      <WorkerFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}