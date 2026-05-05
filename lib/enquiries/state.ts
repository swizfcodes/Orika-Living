// Form-state type and initial value for the enquiry form. Lives outside
// `actions.ts` because that file is a "use server" file and Next.js 16
// forbids non-async-function exports from such files.

export interface EnquiryFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "phone" | "type" | "message", string>
  >;
}

export const initialEnquiryState: EnquiryFormState = { status: "idle" };
