// src/lib/paystack/types.ts
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
    data: {
    amount: number;
    currency: string;
    status: string;
    reference: string;
    metadata: {
      bookingId: string;
    };
  };
}