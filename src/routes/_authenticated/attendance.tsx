import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { upsertAttendance, useAttendance, useRefreshAll, useWorkers } from "@/lib/data";
import { dailyEarning, fmt, formatDate, toISO, todayISO } from "@/lib/calc";
import type { AttendanceStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Mark Attendance — Kaam Saathi" },
      {
        name: "description",
        content: "Mark daily worker attendance with one tap, add overtime hours and save.",
      },
      { property: "og:title", content: "Mark Attendance — Kaam Saathi" },
      { property: "og:description", content: "One-tap daily attendance for your workers." },
    ],
  }),
  component: AttendancePage,
});

const STATUSES: AttendanceStatus[] = ["present", "half_day", "absent", "leave"];

type Entry = { status: AttendanceStatus | null; ot: string };

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, (d ?? 1) + days);
  return toISO(dt);
}

function AttendancePage() {
  const { t } = useI18n();
  const workers = useWorkers();
  const attendance = useAttendance();
  const refresh = useRefreshAll();
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [saving, setSaving] = useState(false);

  const active = useMemo(
    () => (workers.data ?? []).filter((w) => w.status === "active" && w.joining_date <= date),
    [workers.data, date],
  );

  useEffect(() => {
    const rows = (attendance.data ?? []).filter((a) => a.date === date);
    const next: Record<string, Entry> = {};
    for (const w of active) {
      const row = rows.find((r) => r.worker_id === w.id);
      next[w.id] = {
        status: row ? row.status : null,
        ot: row && Number(row.overtime_hours) > 0 ? String(row.overtime_hours) : "",
      };
    }
    setEntries(next);
  }, [attendance.data, date, active]);

  const totals = useMemo(() => {
    let cost = 0;
    let marked = 0;
    for (const w of active) {
      const e = entries[w.id];
      if (!e?.status) continue;
      marked++;
      cost += dailyEarning(w, e.status, Number(e.ot) || 0).total;
    }
    return { cost, marked };
  }, [active, entries]);

  function set(id: string, patch: Partial<Entry>) {
    setEntries((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { status: null, ot: "" }), ...patch } }));
  }

  function markAll() {
    setEntries((prev) => {
      const next = { ...prev };
      for (const w of active) next[w.id] = { ...(next[w.id] ?? { ot: "" }), status: "present" };
      return next;
    });
  }

  async function save() {
    const rows = active
      .map((w) => {
        const e = entries[w.id];
        if (!e?.status) return null;
        const hours = Number(e.ot) || 0;
        const calc = dailyEarning(w, e.status, hours);
        return {
          worker_id: w.id,
          date,
          status: e.status,
          overtime_hours: hours,
          overtime_amount: calc.overtime_amount,
          daily_earning: calc.total,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length === 0) {
      toast.error(t("err_generic"));
      return;
    }
    setSaving(true);
    try {
      await upsertAttendance(rows);
      refresh();
      toast.success(t("attendance_saved"));
    } catch {
      toast.error(t("err_generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title={t("mark_attendance")}>
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        <Button variant="ghost" size="icon" onClick={() => setDate(shiftDate(date, -1))}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="text-center">
          <p className="font-display font-semibold">
            {date === todayISO() ? t("today") : formatDate(date, { weekday: "short" })}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={date >= todayISO()}
          onClick={() => setDate(shiftDate(date, 1))}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {workers.isLoading || attendance.isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {t("no_workers")}
        </p>
      ) : (
        <>
          <Button className="mt-4 h-14 w-full text-base" variant="success" onClick={markAll}>
            <CheckCheck className="size-5" /> {t("mark_all_present")}
          </Button>

          <div className="mt-4 space-y-3">
            {active.map((w) => {
              const e = entries[w.id] ?? { status: null, ot: "" };
              const calc = e.status ? dailyEarning(w, e.status, Number(e.ot) || 0) : null;
              return (
                <div
                  key={w.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.work_type} · {fmt(Number(w.daily_wage))}
                        {t("per_day")}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {e.status ? t(e.status) : t("not_marked")}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set(w.id, { status: s })}
                        className={`min-h-12 rounded-xl border text-xs font-semibold transition-colors ${
                          e.status === s
                            ? s === "present"
                              ? "border-success bg-success text-success-foreground"
                              : s === "half_day"
                                ? "border-warning bg-warning text-warning-foreground"
                                : "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {s === "half_day" ? t("half") : t(s)}
                      </button>
                    ))}
                  </div>

                  {(e.status === "present" || e.status === "half_day") && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs text-muted-foreground" htmlFor={`ot-${w.id}`}>
                        {t("ot_hours")}
                      </label>
                      <Input
                        id={`ot-${w.id}`}
                        value={e.ot}
                        inputMode="numeric"
                        placeholder="0"
                        className="h-11 w-20"
                        onChange={(ev) => set(w.id, { ot: ev.target.value.replace(/[^\d.]/g, "") })}
                      />
                      <span className="ml-auto font-display text-sm font-semibold">
                        {fmt(calc?.total ?? 0)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-24 mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{t("todays_total")}</span>
              <span className="font-display text-xl font-bold">{fmt(totals.cost)}</span>
            </div>
            <Button
              className="mt-3 h-14 w-full text-base"
              disabled={saving || totals.marked === 0}
              onClick={() => void save()}
            >
              {t("save_attendance")}
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}