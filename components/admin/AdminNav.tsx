"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/assets/images/orikaLogo.png";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Inbox,
  Users,
  Droplet,
  Mail,
  LogOut,
  MoreHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/lib/auth/actions";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/scents", label: "Scents", icon: Droplet },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/admin/newsletter", label: "Newsletter", icon: Mail }],
  },
];

// Bottom tabs show the four primary surfaces on mobile. Everything else
// lives behind the "More" sheet.
const primaryTabs: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Catalog", icon: Package },
  { href: "/admin/enquiries", label: "Inbox", icon: Inbox },
];

const moreItems: NavItem[] = [
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/scents", label: "Scents", icon: Droplet },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

interface Props {
  email: string;
  role: string;
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/scents") {
    // Signatures live as a tab inside the Scents page — treat them as the
    // same nav surface so the sidebar stays highlighted when editing one.
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/admin/signatures")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav({ email, role }: Props) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 border-r border-(--border) bg-(--warm-white) flex-col">
        <Link
          href="/admin"
          aria-label="Orika Living Admin"
          className="px-2 py-2 border-b border-(--border) flex flex-col items-center justify-center"
        >
          <Image
            src={logo}
            alt="Orika Living"
            sizes="180px"
            className="h-20 w-auto"
            priority
          />
          <p className="text-[0.85rem] tracking-[0.3em] uppercase text-(--smoke) mt-3">
            Admin
          </p>
        </Link>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-6 min-h-0">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-4 text-[0.55rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2.5 text-sm flex items-center gap-3 rounded-sm transition-colors ${
                        active
                          ? "bg-(--linen) text-(--charcoal) font-medium"
                          : "text-(--charcoal) hover:bg-(--linen) hover:text-(--gold)"
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={active ? 2 : 1.5}
                        className={active ? "text-(--gold)" : ""}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-(--border)">
          <p className="text-xs text-(--smoke) truncate">{email}</p>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
            {role}
          </p>
          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-(--smoke) hover:text-(--charcoal) transition-colors"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-(--warm-white) border-b border-(--border) px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin"
          aria-label="Orika Living Admin"
          className="flex items-center gap-3"
        >
          <Image
            src={logo}
            alt="Orika Living"
            sizes="120px"
            className="h-9 w-auto"
            priority
          />
          <span className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
            Admin
          </span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            className="p-2 text-(--smoke) hover:text-(--charcoal)"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </form>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-(--warm-white) border-t border-(--border) pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[0.55rem] tracking-[0.2em] uppercase transition-colors ${
                    active
                      ? "text-(--gold)"
                      : "text-(--smoke) hover:text-(--charcoal)"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="w-full flex flex-col items-center justify-center gap-1 py-2.5 text-[0.55rem] tracking-[0.2em] uppercase text-(--smoke) hover:text-(--charcoal)"
            >
              <MoreHorizontal size={20} strokeWidth={1.5} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-(--charcoal)/40 backdrop-blur-sm"
          />
          <div className="absolute bottom-0 inset-x-0 bg-(--warm-white) rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke)">
                More
              </p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="p-1 text-(--smoke) hover:text-(--charcoal)"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <ul className="py-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 text-sm ${
                        active ? "text-(--gold)" : "text-(--charcoal)"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="px-6 py-4 border-t border-(--border)">
              <p className="text-xs text-(--smoke) truncate">{email}</p>
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke) mt-1">
                {role}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
