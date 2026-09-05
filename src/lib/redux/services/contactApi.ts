import { baseApi } from "./baseApi";
import type { ContactMessageInput } from "@/lib/validations/contact";

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    subject: string;
    receivedAt: string;
  };
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<ContactMessageResponse, ContactMessageInput>({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;
