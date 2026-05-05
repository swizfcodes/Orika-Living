"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  // Public-schema table names to subscribe to. A change on any of them
  // triggers a debounced router.refresh() so server components re-render.
  tables: readonly string[];
  channel: string;
  debounceMs?: number;
}

// Renders nothing. Keeps every tab on the current route in sync with the
// database — admin edits reflect for browsing customers, new orders appear
// on the admin overview, all without a visible reload.
export default function LiveRevalidator({
  tables,
  channel,
  debounceMs = 800,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), debounceMs);
    };

    const ch = supabase.channel(channel);
    for (const table of tables) {
      ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        schedule,
      );
    }
    ch.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(ch);
    };
  }, [router, tables, channel, debounceMs]);

  return null;
}
