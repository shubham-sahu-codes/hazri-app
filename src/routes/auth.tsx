import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  name: z.string().trim().max(80).optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hazri App" },
      {
        name: "description",
        content: "Sign in to manage worker attendance, wages and payments.",
      },
      { property: "og:title", content: "Sign in — Hazri App" },
      { property: "og:description", content: "Contractor attendance and payment manager." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function submit() {
    const parsed = schema.safeParse({ email, password, name });
    if (!parsed.success) {
      toast.error(
        password.length > 0 && password.length < 6
          ? "Password must be at least 6 characters."
          : "Please enter a valid email and password.",
      );
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: parsed.data.name ?? "" },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
        void navigate({ to: "/home", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        void navigate({ to: "/home", replace: true });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("err_generic"));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(t("err_generic"));
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/home", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-sm text-muted-foreground">
          ← {t("app_name")}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
          {mode === "signup" ? t("sign_up") : t("sign_in")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="font-medium">Check your email to confirm your account.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to {email}.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="a-name">{t("your_name")}</Label>
                <Input
                  id="a-name"
                  className="h-12"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="a-email">{t("email")}</Label>
              <Input
                id="a-email"
                type="email"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-pass">{t("password")}</Label>
              <Input
                id="a-pass"
                type="password"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="h-14 w-full text-base"
              disabled={busy}
              onClick={() => void submit()}
            >
              {mode === "signup" ? t("sign_up") : t("sign_in")}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full"
              disabled={busy}
              onClick={() => void google()}
            >
              {t("continue_google")}
            </Button>
            <button
              type="button"
              className="w-full py-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? t("have_account") : t("no_account")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}