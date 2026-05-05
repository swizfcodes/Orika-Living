import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewsletterComposer from "@/components/admin/NewsletterComposer";
import RemoveSubscriberButton from "@/components/admin/RemoveSubscriberButton";

interface SubscriberRow {
  email: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string;
}

interface CampaignRow {
  id: string;
  subject: string;
  title: string;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

type Tab = "subscribers" | "compose" | "campaigns";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "compose" || tabParam === "campaigns"
      ? tabParam
      : "subscribers";

  const supabase = await createClient();
  const [{ data: subsData }, { data: campaignData }] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false }),
    supabase
      .from("newsletter_campaigns")
      .select("id, subject, title, sent_at, recipient_count, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const subscribers = (subsData ?? []) as SubscriberRow[];
  const campaigns = (campaignData ?? []) as CampaignRow[];
  const active = subscribers.filter((s) => !s.unsubscribed_at);
  const unsubscribed = subscribers.filter((s) => s.unsubscribed_at);

  return (
    <div className="space-y-10 max-w-6xl">
      <header>
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-(--smoke) mb-2">
          Admin
        </p>
        <h1 className="font-display text-4xl md:text-5xl">Newsletter</h1>
        <p className="mt-3 text-sm text-(--smoke)">
          {active.length} active · {unsubscribed.length} unsubscribed ·{" "}
          {campaigns.filter((c) => c.sent_at).length} campaigns sent
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-(--border) pb-3">
        {(
          [
            ["subscribers", `Subscribers (${active.length})`],
            ["compose", "Compose"],
            ["campaigns", `Campaigns (${campaigns.length})`],
          ] as const
        ).map(([key, label]) => {
          const href = key === "subscribers" ? "/admin/newsletter" : `/admin/newsletter?tab=${key}`;
          const isActive = tab === key;
          return (
            <Link
              key={key}
              href={href}
              className={`text-[0.65rem] tracking-[0.25em] uppercase px-4 py-2 border transition-colors ${
                isActive
                  ? "bg-(--charcoal) text-(--warm-white) border-(--charcoal)"
                  : "border-(--border) text-(--charcoal) hover:border-(--charcoal) bg-(--warm-white)"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {tab === "subscribers" && (
        <section className="space-y-8">
          <SubscriberTable title="Active" rows={active} removable />
          {unsubscribed.length > 0 && (
            <SubscriberTable title="Unsubscribed" rows={unsubscribed} />
          )}
        </section>
      )}

      {tab === "compose" && (
        <section className="bg-(--warm-white) border border-(--border) p-8 md:p-10">
          <NewsletterComposer activeCount={active.length} />
        </section>
      )}

      {tab === "campaigns" && (
        <section>
          {campaigns.length === 0 ? (
            <div className="bg-(--warm-white) border border-(--border) p-10 text-center">
              <p className="text-sm text-(--smoke) italic">No campaigns yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="bg-(--warm-white) border border-(--border) p-6 flex flex-wrap items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke) mb-1">
                      {c.sent_at
                        ? `Sent · ${new Date(c.sent_at).toLocaleString()}`
                        : `Draft · ${new Date(c.created_at).toLocaleString()}`}
                    </p>
                    <p className="font-display text-xl text-(--charcoal)">
                      {c.title}
                    </p>
                    <p className="text-xs text-(--smoke) mt-1">{c.subject}</p>
                  </div>
                  {c.sent_at && (
                    <div className="text-right">
                      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
                        Delivered
                      </p>
                      <p className="text-(--charcoal) font-medium">
                        {c.recipient_count}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function SubscriberTable({
  title,
  rows,
  removable = false,
}: {
  title: string;
  rows: SubscriberRow[];
  removable?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-3">
        {title} ({rows.length})
      </p>
      {rows.length === 0 ? (
        <div className="bg-(--warm-white) border border-(--border) p-8 text-center">
          <p className="text-sm text-(--smoke) italic">Nobody here yet.</p>
        </div>
      ) : (
        <ul className="bg-(--warm-white) border border-(--border) divide-y divide-(--border)">
          {rows.map((r) => (
            <li
              key={r.email}
              className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <p className="text-(--charcoal) truncate">{r.email}</p>
                <p className="text-[0.6rem] tracking-[0.25em] uppercase text-(--smoke) mt-1">
                  {r.unsubscribed_at
                    ? `Left ${new Date(r.unsubscribed_at).toLocaleDateString()}`
                    : `Joined ${new Date(r.subscribed_at).toLocaleDateString()}`}
                  {" · "}
                  {r.source}
                </p>
              </div>
              {removable && <RemoveSubscriberButton email={r.email} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
