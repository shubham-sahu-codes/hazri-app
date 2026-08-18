import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Check, KeyRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { redeemPlanCode, useSubscription } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription Plans — Hazri App" },
      {
        name: "description",
        content:
          "Hazri App subscription plans: Base plan for 1 month at Rs 1499 and Median plan for 3 months at Rs 2999. Activate with your code.",
      },
      { property: "og:title", content: "Subscription Plans — Hazri App" },
      {
        property: "og:description",
        content: "Base 1 month Rs 1499, Median 3 months Rs 2999. Activate using an activation code.",
      },
    ],
  }),
  component: SubscriptionPage,
});

const PLANS = [
  {
    id: "base" as const,
    name: "Base Plan",
    price: 1499,
    duration: "1 month",
    perks: ["Unlimited workers", "Attendance & overtime", "Payment records"],
  },
  {
    id: "median" as const,
    name: "Median Plan",
    price: 2999,
    duration: "3 months",
    perks: ["Sab Base features", "3 mahine ki validity", "Monthly summary & CSV export"],
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SubscriptionPage() {
  const qc = useQueryClient();
  const sub = useSubscription();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const active = sub.data && new Date(sub.data.expires_at).getTime() > Date.now();

  async function activate() {
    const value = code.trim();
    if (!value) {
      toast.error("Pehle activation code daaliye");
      return;
    }
    setBusy(true);
    try {
      const { plan } = await redeemPlanCode(value);
      await qc.invalidateQueries({ queryKey: ["subscription"] });
      setCode("");
      toast.success(plan === "median" ? "Median Plan activate ho gaya" : "Base Plan activate ho gaya");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "invalid_code";
      toast.error(
        msg === "code_used"
          ? "Yeh code pehle hi use ho chuka hai"
          : msg === "not_signed_in"
            ? "Pehle sign in kijiye"
            : "Code galat hai",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Subscription" subtitle="Plan chuniye aur code se activate kijiye">
      {active && sub.data && (
        <section className="mb-4 rounded-2xl border border-success/30 bg-success-soft p-5">
          <div className="flex items-center gap-2 text-success">
            <BadgeCheck className="size-5" />
            <span className="font-display font-semibold">
              {sub.data.plan === "median" ? "Median Plan" : "Base Plan"} active
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Valid till {formatDate(sub.data.expires_at)}
          </p>
        </section>
      )}

      <div className="space-y-3">
        {PLANS.map((p) => (
          <section
            key={p.id}
            className={`rounded-2xl border p-5 shadow-card ${
              active && sub.data?.plan === p.id
                ? "border-primary bg-card"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display font-semibold">{p.name}</h2>
              <span className="font-display text-xl font-bold">₹{p.price}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{p.duration} validity</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="size-4 text-success" /> {perk}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display font-semibold">
          <KeyRound className="size-4" /> Activation code
        </h2>
        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="plan-code">Code</Label>
            <Input
              id="plan-code"
              className="h-12 uppercase"
              placeholder="HAZRI-XXXX-0000"
              value={code}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button className="h-12 w-full" disabled={busy} onClick={() => void activate()}>
            {busy ? "Activating..." : "Activate plan"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Code se plan turant chalu ho jayega. Ek code sirf ek baar use hota hai.
          </p>
        </div>
      </section>
    </AppShell>
  );
}