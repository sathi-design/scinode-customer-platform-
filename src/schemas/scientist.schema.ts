import { z } from "zod";

export const scientistProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  title: z.enum(
    ["Dr.", "Prof.", "Mr.", "Ms.", "Researcher"],
    { required_error: "Select your title" }
  ),
  institution: z.string().min(2, "Institution is required"),
  department: z.string().min(2, "Department is required"),
  country: z.string().min(2, "Country is required"),
  bio: z
    .string()
    .min(100, "Bio must be at least 100 characters")
    .max(500, "Bio must be under 500 characters"),
  orcidId: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, "Invalid ORCID format")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export const scientistResearchSchema = z.object({
  researchInterests: z
    .array(z.string())
    .min(1, "Select at least one research interest"),
  expertise: z.array(z.string()).min(1, "Select at least one expertise area"),
  therapeuticFocus: z.array(z.string()),
  methodology: z.array(z.string()),
});

export const scientistPublicationsSchema = z.object({
  publications: z
    .number()
    .min(0, "Must be 0 or more")
    .max(1000, "Please enter a valid number"),
  hIndex: z.number().min(0).max(200).optional(),
  citations: z.number().min(0).optional(),
  highImpactJournals: z.array(z.string()),
  openToCollaboration: z.boolean(),
  availableForConsulting: z.boolean(),
});

export type ScientistProfileFormValues = z.infer<typeof scientistProfileSchema>;
export type ScientistResearchFormValues = z.infer<typeof scientistResearchSchema>;
export type ScientistPublicationsFormValues = z.infer<typeof scientistPublicationsSchema>;
