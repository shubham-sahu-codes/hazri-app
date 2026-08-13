export type WorkerStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "half_day" | "absent" | "leave";
export type PaymentType = "salary" | "advance" | "partial_payment" | "final_payment";
export type PaymentMethod = "cash" | "upi" | "bank" | "other";

export const WORK_TYPES = [
  "Mason",
  "Helper",
  "Carpenter",
  "Electrician",
  "Plumber",
  "Painter",
  "Welder",
  "Other",
] as const;

export interface Worker {
  id: string;
  name: string;
  phone: string | null;
  work_type: string;
  daily_wage: number;
  overtime_rate: number;
  joining_date: string;
  status: WorkerStatus;
  created_at: string;
}

export interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: AttendanceStatus;
  overtime_hours: number;
  overtime_amount: number;
  daily_earning: number;
}

export interface Payment {
  id: string;
  worker_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  date: string;
  notes: string | null;
  created_at: string;
}