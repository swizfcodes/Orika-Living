declare module "@paystack/inline-js" {
  export interface NewTransactionOptions {
    key: string;
    email: string;
    amount: number; // in kobo
    reference: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { reference: string; status: string }) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
    onLoad?: (response: unknown) => void;
  }

  export default class PaystackPop {
    newTransaction(options: NewTransactionOptions): void;
  }
}
