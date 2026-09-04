import * as z from "zod";

export const userRegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, underscores, and hyphens allowed"),
    firstName: z.string().min(1, "First name is required").max(70, "First name must not exceed 70 characters"),
    lastName: z.string().min(1, "Last name is required").max(70, "Last name must not exceed 70 characters"),
    email: z.string().email("Please enter a valid email address").max(255, "Email must not exceed 255 characters"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?[0-9]{8,15}$/.test(val), {
        message: "Phone must be 8-15 digits, optional leading +",
      }),
    password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password").max(100, "Password must not exceed 100 characters"),
    country: z.string().optional(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;

export const phoneValidation = z
  .string()
  .min(1, "Phone number is required")
  .max(30, "Phone number must not exceed 30 characters")
  .refine((val) => val.trim().length > 0, {
    message: "Phone number is required",
  })
  .refine((val) => /^\+?[0-9(][0-9\s().-]*[0-9]$/.test(val), {
    message: "Phone number must start with a digit or '(' and end with a digit",
  })
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    },
    {
      message: "Phone number must contain between 8 and 15 digits",
    },
  );

export const companyRegisterSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    jobTitle: z.string().min(1, "Please select a job title"),
    phone: phoneValidation,
    email: z.string().email("Please enter a valid work email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    agreeTermsStep1: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service",
    }),

    companyName: z.string().min(2, "Company name is required"),
    companyWebsite: z.string().url("Please enter a valid website URL (e.g. https://readme.org)"),
    industry: z.string().min(1, "Please select an industry"),
    companySize: z.string().min(1, "Please select company size"),
    country: z.string().min(1, "Please select your country"),
    joiningReason: z.string().min(1, "Please select why you are joining"),
    agreeTermsStep2: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CompanyRegisterFormValues = z.infer<typeof companyRegisterSchema>;

export const registerRequestSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Only letters, numbers, dots, underscores, and hyphens allowed"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(70, "First name must not exceed 70 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(70, "Last name must not exceed 70 characters"),
    phone: z
      .string()
      .max(30, "Phone must not exceed 30 characters")
      .regex(/^\+?[0-9]{8,15}$/, "Phone must be 8-15 digits, optional leading +")
      .optional(),
    accountType: z.enum(["USER", "COMPANY", "ADMIN"]).default("USER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterRequestBody = z.infer<typeof registerRequestSchema>;

export interface RegisterResponseBody {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: "USER" | "COMPANY" | "ADMIN";
}

export const registerCompanyRequestSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    jobTitle: z.string().min(1, "Job title is required"),
    phone: phoneValidation,
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    companyName: z.string().min(2, "Company name is required"),
    companyWebsite: z.string().url("Please enter a valid website URL"),
    industry: z.enum([
      "TECHNOLOGY",
      "FINANCE",
      "HEALTHCARE",
      "ECOMMERCE",
      "GOVERNMENT",
      "EDUCATION",
      "OTHER",
    ]),
    companySize: z.enum([
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+",
    ]),
    country: z.string().min(1, "Country is required"),
    joiningReason: z.string().min(1, "Joining reason is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterCompanyBody = z.infer<typeof registerCompanyRequestSchema>;
