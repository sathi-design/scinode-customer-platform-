import { z } from "zod";

export const croOrgSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  organizationType: z.enum(
    ["Full-Service CRO", "Niche CRO", "Academic CRO", "Virtual CRO"],
    { required_error: "Select organization type" }
  ),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  yearsOperating: z
    .number()
    .min(0, "Must be 0 or more")
    .max(100, "Must be 100 or less"),
  teamSize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
    required_error: "Select team size",
  }),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
});

export const croServicesSchema = z.object({
  servicesOffered: z
    .array(z.string())
    .min(1, "Select at least one service"),
  therapeuticAreas: z
    .array(z.string())
    .min(1, "Select at least one therapeutic area"),
  studyPhases: z.array(z.string()).min(1, "Select at least one phase"),
  description: z.string().min(50, "Please provide at least 50 characters"),
});

export const croCertSchema = z.object({
  certifications: z.array(z.string()).min(1, "Select at least one certification"),
  fdaRegistered: z.boolean(),
  isoStandards: z.array(z.string()),
  additionalCerts: z.string().optional(),
});

export type CROOrgFormValues = z.infer<typeof croOrgSchema>;
export type CROServicesFormValues = z.infer<typeof croServicesSchema>;
export type CROCertFormValues = z.infer<typeof croCertSchema>;
