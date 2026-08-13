import { supabase } from "@/integrations/supabase/client";
import { currentUserId } from "./data";
import { dailyEarning, toISO } from "./calc";
import type { AttendanceStatus } from "./types";

const DEMO_WORKERS = [
  { name: "Ramesh Kumar", work_type: "Mason", daily_wage: 800, overtime_rate: 100, phone: "9812345670" },
  { name: "Suresh Yadav", work_type: "Helper", daily_wage: 600, overtime_rate: 75, phone: "9812345671" },
  { name: "Amit Sharma", work_type: "Carpenter", daily_wage: 1000, overtime_rate: 125, phone: "9812345672" },
  { name: "Ravi Patil", work_type: "Electrician", daily_wage: 900, overtime_rate: 110, phone: "9812345673" },
  { name: "Mahesh Jadhav", work_type: "Plumber", daily_wage: 850, overtime_rate: 100, phone: "9812345674" },
];

/** Seeds a realistic demo business for the signed-in contractor. */
export async function loadDemoData() {
  const user_id = await currentUserId();

  const { data: existingBiz } = await supabase
    .from("businesses")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!existingBiz) {
    await supabase
      .from("businesses")
      .insert({ user_id, business_name: "Shubham Construction", phone: "9800000000" });
  }

  const joining = new Date();
  joining.setDate(joining.getDate() - 40);

  const { data: inserted, error } = await supabase
    .from("workers")
    .insert(
      DEMO_WORKERS.map((w) => ({
        ...w,
        user_id,
        joining_date: toISO(joining),
        status: "active",
      })),
    )
    .select("id,daily_wage,overtime_rate");
  if (error) throw error;
  const workers = inserted ?? [];

  // Attendance for the last 20 days (skipping Sundays).
  const attendanceRows: Array<{
    user_id: string;
    worker_id: string;
    date: string;
    status: string;
    overtime_hours: number;
    overtime_amount: number;
    daily_earning: number;
  }> = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) continue;
    const date = toISO(d);
    workers.forEach((w, idx) => {
      const seed = (i * 7 + idx * 3) % 10;
      const status: AttendanceStatus =
        seed === 0 ? "absent" : seed === 1 ? "half_day" : "present";
      const otHours = seed === 5 ? 2 : 0;
      const calc = dailyEarning(
        { daily_wage: Number(w.daily_wage), overtime_rate: Number(w.overtime_rate) },
        status,
        otHours,
      );
      attendanceRows.push({
        user_id,
        worker_id: w.id,
        date,
        status,
        overtime_hours: otHours,
        overtime_amount: calc.overtime_amount,
        daily_earning: calc.total,
      });
    });
  }
  if (attendanceRows.length) {
    const { error: attErr } = await supabase
      .from("attendance")
      .upsert(attendanceRows, { onConflict: "worker_id,date" });
    if (attErr) throw attErr;
  }

  // A few payments and advances.
  const paymentRows: Array<{
    user_id: string;
    worker_id: string;
    amount: number;
    payment_type: string;
    payment_method: string;
    date: string;
    notes: string;
  }> = [];
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toISO(d);
  };
  workers.forEach((w, idx) => {
    paymentRows.push({
      user_id,
      worker_id: w.id,
      amount: 5000 + idx * 1000,
      payment_type: "salary",
      payment_method: idx % 2 === 0 ? "cash" : "upi",
      date: daysAgo(9 + idx),
      notes: "Part salary",
    });
    if (idx % 2 === 0) {
      paymentRows.push({
        user_id,
        worker_id: w.id,
        amount: 2000,
        payment_type: "advance",
        payment_method: "cash",
        date: daysAgo(4 + idx),
        notes: "Advance",
      });
    }
  });
  const { error: payErr } = await supabase.from("payments").insert(paymentRows);
  if (payErr) throw payErr;
}