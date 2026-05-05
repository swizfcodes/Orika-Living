// Form-state types and initial values for the newsletter flows. Lives in
// its own module because the parent `actions.ts` is a "use server" file —
// Next.js 16 forbids non-async-function exports from such files, so const
// initial-state objects live here instead.

export interface SubscribeFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const initialSubscribeState: SubscribeFormState = { status: "idle" };

export interface CampaignFormState {
  status: "idle" | "success" | "error";
  message?: string;
  recipientCount?: number;
}

export const initialCampaignState: CampaignFormState = { status: "idle" };
