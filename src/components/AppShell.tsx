import { Link } from "@tanstack/react-router";
import { Home, ClipboardCheck, HardHat, Wallet, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

const items = [
  { to: "/home", icon: Home, key: "home" },
  { to: "/attendance", icon: ClipboardCheck, key: "attendance" },
  { to: "/workers", icon: HardHat, key: "workers" },
  { to: "/payments", icon: Wallet, key: "payments" },
  { to: "/more", icon: MoreHorizontal, key: "more" },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6">
        {(title || action) && (
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              {title && (
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {action}
          </header>
        )}
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl">
          {items.map(({ to, icon: Icon, key }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" />
              {t(key)}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}