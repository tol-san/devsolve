import { baseApi } from "./baseApi";

export interface RegisterUserRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  accountType?: "USER" | "COMPANY" | "ADMIN";
}

export interface SocialSyncResponse {
  created: boolean;
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string;
    status: string;
  };
}

export interface RegisterUserResponse {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: "USER" | "COMPANY" | "ADMIN";
}

export interface RegisterUserFormData {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  country?: string;
  role?: "user" | "company";
}

export interface RegisterUserResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
}

export interface RegisterApiResponse {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountType?: "USER" | "COMPANY" | "ADMIN";
}

export type IndustryEnum =
  | "TECHNOLOGY"
  | "FINANCE"
  | "HEALTHCARE"
  | "ECOMMERCE"
  | "GOVERNMENT"
  | "EDUCATION"
  | "OTHER";

export type CompanySizeEnum =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export interface RegisterCompanyRequest {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyWebsite: string;
  industry: IndustryEnum;
  companySize: CompanySizeEnum;
  country: string;
  joiningReason: string;
}

export interface RegisterCompanyApiResponse {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain: string;
  websiteUrl: string;
  logoUrl: string | null;
  description: string | null;
  industry: IndustryEnum;
  companySize: string;
  country: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  submissionVersion: number;
  rejectionReason: string | null;
  reviewedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterCompanyResponse {
  success: boolean;
  message?: string;
  organization?: RegisterCompanyApiResponse;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<RegisterUserResponse, RegisterUserRequest>({
      query: (body) => ({
        url: `/auth/register`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    syncSocialAccount: builder.mutation<SocialSyncResponse, void>({
      query: () => ({
        url: `/auth/social/sync`,
        method: "POST",
      }),
      invalidatesTags: ["Profile", "User"],
    }),

    registerCompany: builder.mutation<RegisterCompanyResponse, RegisterCompanyRequest>({
      query: (body) => ({
        url: "/organizations/register",
        method: "POST",
        body,
      }),
      transformResponse: (raw: RegisterCompanyApiResponse): RegisterCompanyResponse => ({
        success: true,
        message: "Company registration submitted successfully! Your application is under review.",
        organization: raw,
      }),
      invalidatesTags: ["Organization"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterUserMutation,
  useRegisterCompanyMutation,
  useSyncSocialAccountMutation,
} = authApi;
