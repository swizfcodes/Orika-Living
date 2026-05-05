import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Enquiry, EnquiryStatus } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import SendTradePackButton from "@/components/admin/SendTradePackButton";
import Pagination from "@/components/admin/Pagination";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import FilterPills from "@/components/admin/FilterPills";
import { updateEnquiryStatusAction } from "@/lib/admin/enquiries";

const PAGE_SIZE = 50;

interface EnquiryRow extends Enquiry {
  trade_pack_sent_at: string | null;
}

const enquiryStatuses: readonly EnquiryStatus[] = [
  "new",
  "read",
  "replied",
  "closed",
];

const filters: (EnquiryStatus | "all")[] = ["all", ...enquiryStatuses];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminEnquiriesPage({ searchParams }: PageProps) {
  const { status, page: rawPage } = await searchParams;
  const active = (filters.includes(status as EnquiryStatus) ? status : "all") as
    | EnquiryStatus
    | "all";
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (active !== "all") query = query.eq("status", active);
  const { data, count } = await query;
  const enquiries = (data ?? []) as EnquiryRow[];

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader title="Enquiries" />

      <FilterPills
        options={filters}
        active={active}
        basePath="/admin/enquiries"
      />

      {enquiries.length === 0 ? (
        <div className="bg-(--warm-white) border border-(--border)">
          <EmptyState label="No enquiries in this bucket." />
        </div>
      ) : (
        <ul className="space-y-4">
          {enquiries.map((e) => (
            <li
              key={e.id}
              className="bg-(--warm-white) border border-(--border) p-6 md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-(--smoke) mb-1">
                    {e.type}
                  </p>
                  <p className="font-display text-xl text-(--charcoal)">
                    {e.name}
                  </p>
                  <p className="text-xs text-(--smoke) mt-1">
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                </div>
                <EnquiryStatusControl id={e.id} status={e.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm">
                <a
                  href={`mailto:${e.email}`}
                  className="text-(--charcoal) hover:text-(--gold) truncate"
                >
                  {e.email}
                </a>
                <a
                  href={`tel:${e.phone}`}
                  className="text-(--charcoal) hover:text-(--gold) truncate"
                >
                  {e.phone}
                </a>
              </div>

              <p className="text-sm text-(--charcoal) leading-relaxed whitespace-pre-wrap border-t border-(--border) pt-4">
                {e.message}
              </p>

              {e.type === "Retail / Stockist Partnership" && (
                <div className="mt-5 pt-4 border-t border-(--border) flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[0.6rem] tracking-[0.3em] uppercase text-(--smoke)">
                    Trade pack
                  </p>
                  <SendTradePackButton
                    enquiryId={e.id}
                    alreadySentAt={e.trade_pack_sent_at}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        total={count ?? 0}
        pageSize={PAGE_SIZE}
        basePath="/admin/enquiries"
        query={{ status: active === "all" ? undefined : active }}
      />
    </div>
  );
}

function EnquiryStatusControl({
  id,
  status,
}: {
  id: string;
  status: EnquiryStatus;
}) {
  const update = async (next: EnquiryStatus) => {
    "use server";
    return updateEnquiryStatusAction({ id, status: next });
  };

  return (
    <StatusSelect
      label="Status"
      value={status}
      options={enquiryStatuses}
      onChange={update}
    />
  );
}
