import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Hazri App" },
      { name: "description", content: "Set a new password for your Hazri App account." },
      { property: "og:title", content: "Reset password — Hazri App" },
      { property: "og:description", content: "Set a new password for your Hazri App account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      void navigate({ to: "/home", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl font-bold tracking-tight">Set a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Open this page from the reset link in your email to continue.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rp-new">New password</Label>
              <Input
                id="rp-new"
                type="password"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rp-confirm">Confirm password</Label>
              <Input
                id="rp-confirm"
                type="password"
                className="h-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button className="h-14 w-full text-base" disabled={busy} onClick={() => void submit()}>
              Update password
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
