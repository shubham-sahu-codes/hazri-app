import type { Attendance, AttendanceStatus, Payment, Worker } from "./types";

export function fmt(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

export function todayISO(): string {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function wageFactor(status: AttendanceStatus): number {
  if (status === "present") return 1;
  if (status === "half_day") return 0.5;
  return 0;
}

/** Earning locked in at the time attendance is marked (historical wage safe). */
export function dailyEarning(
  worker: Pick<Worker, "daily_wage" | "overtime_rate">,
  status: AttendanceStatus,
  overtimeHours: number,
): { base: number; overtime_amount: number; total: number } {
  const base = Number(worker.daily_wage) * wageFactor(status);
  const overtime_amount =
    status === "absent" || status === "leave"
      ? 0
      : Number(worker.overtime_rate) * (overtimeHours || 0);
  return { base, overtime_amount, total: base + overtime_amount };
}

export interface WorkerTotals {
  presentDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  baseEarnings: number;
  overtime: number;
  gross: number;
  advance: number;
  paid: number;
  totalGiven: number;
  pending: number;
}

export function workerTotals(
  attendance: Attendance[],
  payments: Payment[],
): WorkerTotals {
  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let baseEarnings = 0;
  let overtime = 0;

  for (const a of attendance) {
    if (a.status === "present") presentDays++;
    else if (a.status === "half_day") halfDays++;
    else if (a.status === "absent") absentDays++;
    else leaveDays++;
    overtime += Number(a.overtime_amount);
    baseEarnings += Number(a.daily_earning) - Number(a.overtime_amount);
  }

  let advance = 0;
  let paid = 0;
  for (const p of payments) {
    if (p.payment_type === "advance") advance += Number(p.amount);
    else paid += Number(p.amount);
  }

  const gross = baseEarnings + overtime;
  const totalGiven = advance + paid;
  return {
    presentDays,
    halfDays,
    absentDays,
    leaveDays,
    baseEarnings,
    overtime,
    gross,
    advance,
    paid,
    totalGiven,
    pending: Math.max(0, gross - totalGiven),
  };
}

export function monthRange(d = new Date()): { from: string; to: string } {
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: toISO(from), to: toISO(to) };
}

export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

/** Attendance only counts from the worker's joining date onwards. */
export function attendanceFor(
  worker: Worker,
  attendance: Attendance[],
  from?: string,
  to?: string,
): Attendance[] {
  return attendance.filter(
    (a) =>
      a.worker_id === worker.id &&
      a.date >= worker.joining_date &&
      (!from || a.date >= from) &&
      (!to || a.date <= to),
  );
}

export function paymentsFor(
  workerId: string,
  payments: Payment[],
  from?: string,
  to?: string,
): Payment[] {
  return payments.filter(
    (p) => p.worker_id === workerId && (!from || p.date >= from) && (!to || p.date <= to),
  );
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}