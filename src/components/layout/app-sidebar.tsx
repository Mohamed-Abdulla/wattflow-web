"use client";

import { LayoutDashboard, BookOpen, Zap } from "lucide-react";
import { NavItem } from "./nav-item";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/swagger", label: "API Docs", icon: <BookOpen className="h-4 w-4" /> },
];

export function AppSidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-semibold tracking-tight">Wattflow Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Version */}
      <div className="border-t p-3">
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
    </aside>
  );
}
