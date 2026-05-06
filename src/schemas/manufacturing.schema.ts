import { z } from "zod";

export const manufacturingFacilitySchema = z.object({
  facilityName: z.string().min(2, "Facility name is required"),
  facilityType: z.enum(
    ["API Manufacturing", "Formulation", "Biologics", "Packaging", "Full-Service"],
    { required_error: "Select facility type" }
  ),
  location: z.string().min(2, "Location is required"),
  capacity: z.enum(
    ["<100 kg/year", "100–1000 kg/year", "1–10 MT/year", ">10 MT/year"],
    { required_error: "Select capacity range" }
  ),
  gmpCertified: z.boolean(),
  fdaInspected: z.boolean(),
  yearEstablished: z
    .number()
    .min(1900)
    .max(new Date().getFullYear()),
});

export const manufacturingCapabilitySchema = z.object({
  productionCapabilities: z
    .array(z.string())
    .min(1, "Select at least one capability"),
  equipmentTypes: z.array(z.string()).min(1, "Select at least one equipment type"),
  dosageForms: z.array(z.string()).min(1, "Select at least one dosage form"),
  batchSizeRange: z.string().min(1, "Batch size range is required"),
});

export const manufacturingComplianceSchema = z.object({
  complianceCerts: z
    .array(z.string())
    .min(1, "Select at least one certification"),
  regulatoryApprovals: z.array(z.string()),
  auditReadiness: z.enum(["Ready", "Pending", "In Progress"], {
    required_error: "Select audit readiness",
  }),
  lastAuditDate: z.string().optional(),
});

export type ManufacturingFacilityFormValues = z.infer<typeof manufacturingFacilitySchema>;
export type ManufacturingCapabilityFormValues = z.infer<typeof manufacturingCapabilitySchema>;
export type ManufacturingComplianceFormValues = z.infer<typeof manufacturingComplianceSchema>;
