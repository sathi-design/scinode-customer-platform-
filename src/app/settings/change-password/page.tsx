"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, CircleCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { mockChangePassword } from "@/services/auth.service";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "New password must be different from current",
    path: ["newPassword"],
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColor =
    score <= 1 ? "bg-[#E53D4C]" : score === 2 ? "bg-[#F59E0B]" : score === 3 ? "bg-[#3B82F6]" : "bg-[#1F6F54]";
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? barColor : "bg-[#E8E8E8]"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs ${c.pass ? "text-[#1F6F54]" : "text-[#B0B0B0]"}`}>
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <p className="font-semibold text-base leading-6 text-[#111] mb-1.5">
        {label}<span className="text-[#E53D4C] ml-0.5">*</span>
      </p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          {...props}
          className={`w-full h-[40px] pl-3 pr-10 bg-white border rounded-[6px] text-[16px] font-normal leading-6 text-[#111] placeholder:text-[#B0B0B0] outline-none transition-all
            ${error ? "border-[#E53D4C]" : "border-[#E8E8E8] focus:border-[#1F6F54] focus:ring-2 focus:ring-[#1F6F54]/10"}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#111]"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-[#E53D4C] mt-1">{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const newPwd = watch("newPassword") ?? "";

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await mockChangePassword(data.currentPassword, data.newPassword);
      setDone(true);
      reset();
    } catch {
      setServerError("Current password is incorrect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto py-8 px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#818181] hover:text-[#111] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#111]">Change Password</h1>
            <p className="text-sm text-[#818181] mt-1">
              Update your password to keep your account secure.
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="bg-[#D8F3DC] rounded-xl p-4 flex items-center justify-center mb-4">
                <CircleCheck className="w-7 h-7 text-[#1F6F54]" />
              </div>
              <h2 className="text-base font-semibold text-[#111] mb-1">Password updated</h2>
              <p className="text-sm text-[#818181] mb-6">
                Your password has been changed successfully.
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="w-full h-10 bg-white hover:bg-[#F9FAFB] border border-[#E8E8E8] text-[#111] text-sm font-medium rounded-[6px] transition-colors"
              >
                Change again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <PasswordField
                label="Current Password"
                placeholder="Enter current password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register("currentPassword")}
              />

              <div className="border-t border-[#E8E8E8]" />

              <div>
                <PasswordField
                  label="New Password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />
                {newPwd && <PasswordStrength password={newPwd} />}
              </div>

              <PasswordField
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {serverError && (
                <div className="bg-[#FFEFEF] border border-[#E53D4C]/20 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-[#C30E1A]">{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#1F6F54] hover:bg-[#185C45] disabled:opacity-60 disabled:cursor-not-allowed text-[#FAFAFA] text-sm font-medium rounded-[6px] flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? "Saving…" : "Update password"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
