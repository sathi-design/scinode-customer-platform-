"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { mockChangeEmail } from "@/services/auth.service";

const step1Schema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Password is required to confirm your identity"),
});
type Step1Values = z.infer<typeof step1Schema>;

export default function ChangeEmailPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingEmail, setPendingEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    mode: "onTouched",
  });

  const onSubmit = async (data: Step1Values) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await mockChangeEmail(data.newEmail, data.currentPassword);
      setPendingEmail(data.newEmail);
      setStep(2);
    } catch {
      setServerError("Password is incorrect. Please try again.");
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
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[#111]">Change Email</h1>
                <p className="text-sm text-[#818181] mt-1">
                  Current email:{" "}
                  <span className="font-medium text-[#111]">{user?.email ?? "—"}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <p className="font-semibold text-base leading-6 text-[#111] mb-1.5">
                    New Email Address<span className="text-[#E53D4C] ml-0.5">*</span>
                  </p>
                  <input
                    type="email"
                    placeholder="new@company.com"
                    autoComplete="email"
                    {...register("newEmail")}
                    className={`w-full h-[40px] px-3 bg-white border rounded-[6px] text-[16px] font-normal leading-6 text-[#111] placeholder:text-[#B0B0B0] outline-none transition-all
                      ${errors.newEmail ? "border-[#E53D4C]" : "border-[#E8E8E8] focus:border-[#1F6F54] focus:ring-2 focus:ring-[#1F6F54]/10"}`}
                  />
                  {errors.newEmail && <p className="text-xs text-[#E53D4C] mt-1">{errors.newEmail.message}</p>}
                </div>

                <div>
                  <p className="font-semibold text-base leading-6 text-[#111] mb-1.5">
                    Confirm with Password<span className="text-[#E53D4C] ml-0.5">*</span>
                  </p>
                  <p className="text-xs text-[#818181] mb-1.5">We need your password to authorize this change.</p>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      {...register("currentPassword")}
                      className={`w-full h-[40px] pl-3 pr-10 bg-white border rounded-[6px] text-[16px] font-normal leading-6 text-[#111] placeholder:text-[#B0B0B0] outline-none transition-all
                        ${errors.currentPassword ? "border-[#E53D4C]" : "border-[#E8E8E8] focus:border-[#1F6F54] focus:ring-2 focus:ring-[#1F6F54]/10"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#111]"
                      tabIndex={-1}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-[#E53D4C] mt-1">{errors.currentPassword.message}</p>}
                </div>

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
                  {isLoading ? "Verifying…" : "Update email"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="bg-[#D8F3DC] rounded-xl p-4 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-[#1F6F54]" />
              </div>
              <h2 className="text-base font-semibold text-[#111] mb-1">
                Verification email sent
              </h2>
              <p className="text-sm text-[#818181] mb-2">
                We&apos;ve sent a confirmation link to
              </p>
              <p className="text-sm font-semibold text-[#111] mb-6">{pendingEmail}</p>

              <div className="w-full bg-[#F9FAFB] border border-[#E8E8E8] rounded-xl p-4 text-left space-y-1.5 mb-6">
                <p className="text-xs font-medium text-[#818181]">Next steps</p>
                <ul className="text-xs text-[#666] space-y-1">
                  <li>• Click the link in the email to confirm the change</li>
                  <li>• Your email will update once confirmed</li>
                  <li>• The link expires in 24 hours</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full h-10 bg-white hover:bg-[#F9FAFB] border border-[#E8E8E8] text-[#111] text-sm font-medium rounded-[6px] transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
