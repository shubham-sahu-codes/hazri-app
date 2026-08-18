import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Attendance, Payment, Worker } from "./types";

export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useWorkers() {
  return useQuery({
    queryKey: ["workers"],
    queryFn: async (): Promise<Worker[]> => {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Worker[];
    },
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async (): Promise<Attendance[]> => {
      const { data, error } = await supabase
        .from("attendance")
        .select("id,worker_id,date,status,overtime_hours,overtime_amount,daily_earning")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Attendance[];
    },
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Payment[];
    },
  });
}

export interface Business {
  id: string;
  business_name: string;
  contractor_name: string | null;
  phone: string | null;
}

export function useBusiness() {
  return useQuery({
    queryKey: ["business"],
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id,business_name,contractor_name,phone")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Business | null;
    },
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["workers"] });
    void qc.invalidateQueries({ queryKey: ["attendance"] });
    void qc.invalidateQueries({ queryKey: ["payments"] });
    void qc.invalidateQueries({ queryKey: ["business"] });
  };
}

export interface Subscription {
  id: string;
  plan: "base" | "median";
  started_at: string;
  expires_at: string;
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id,plan,started_at,expires_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Subscription | null;
    },
  });
}

export async function redeemPlanCode(code: string): Promise<{ plan: "base" | "median" }> {
  const { data, error } = await supabase.rpc("redeem_plan_code", { _code: code });
  if (error) throw new Error(error.message);
  const res = data as { ok: boolean; error?: string; plan?: "base" | "median" };
  if (!res?.ok) throw new Error(res?.error ?? "invalid_code");
  return { plan: res.plan ?? "base" };
}

export async function saveWorker(input: {
  id?: string;
  name: string;
  phone: string | null;
  work_type: string;
  daily_wage: number;
  overtime_rate: number;
  joining_date: string;
  status: "active" | "inactive";
}) {
  const user_id = await currentUserId();
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("workers").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("workers").insert({ ...input, user_id });
  if (error) throw error;
}

export async function setWorkerStatus(id: string, status: "active" | "inactive") {
  const { error } = await supabase.from("workers").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteWorker(id: string) {
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertAttendance(
  rows: Array<{
    worker_id: string;
    date: string;
    status: string;
    overtime_hours: number;
    overtime_amount: number;
    daily_earning: number;
  }>,
) {
  if (rows.length === 0) return;
  const user_id = await currentUserId();
  const { error } = await supabase
    .from("attendance")
    .upsert(
      rows.map((r) => ({ ...r, user_id })),
      { onConflict: "worker_id,date" },
    );
  if (error) throw error;
}

export async function recordPayment(input: {
  worker_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  date: string;
  notes: string | null;
}) {
  const user_id = await currentUserId();
  const { error } = await supabase.from("payments").insert({ ...input, user_id });
  if (error) throw error;
}

export async function saveBusiness(input: {
  id?: string;
  business_name: string;
  contractor_name: string | null;
  phone: string | null;
}) {
  const user_id = await currentUserId();
  if (input.id) {
    const { id, ...rest } = input;
    const { error } = await supabase.from("businesses").update(rest).eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("businesses").insert({ ...input, user_id });
  if (error) throw error;
}