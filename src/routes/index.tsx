import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClipboardCheck, HardHat, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaam Saathi — Contractor Attendance & Payment Manager" },
      {
        name: "description",
        content:
          "Mark attendance, auto-calculate wages, overtime and advances, and settle worker payments in seconds.",
      },
      { property: "og:title", content: "Kaam Saathi — Contractor Attendance & Payment Manager" },
      {
        property: "og:description",
        content: "Worker ki attendance se lekar payment tak — sab automatic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col justify-center bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-md">
        <span className="inline-flex items-center rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          {t("subtitle")}
        </span>
        <h1 className="mt-5 font-display text-4xl leading-tight font-bold tracking-tight text-foreground">
          {t("app_name")}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{t("tagline")}</p>

        <div className="mt-8 space-y-3">
          {[
            { icon: ClipboardCheck, text: t("mark_attendance") },
            { icon: Wallet, text: t("pay_worker") },
            { icon: HardHat, text: t("add_worker") },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </span>
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Button asChild className="h-14 w-full text-base">
            <Link to="/auth">{t("get_started")}</Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 w-full">
            <Link to="/auth">{t("sign_in")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
