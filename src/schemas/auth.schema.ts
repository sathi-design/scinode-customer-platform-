import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const roleSchema = z.object({
  role: z.enum(["cro", "manufacturing", "scientist"], {
    required_error: "Please select your role",
  }),
});

export const baseSignupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RoleFormValues = z.infer<typeof roleSchema>;
export type BaseSignupFormValues = z.infer<typeof baseSignupSchema>;
