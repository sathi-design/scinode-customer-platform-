"use client";

/**
 * PricingModal — thin wrapper kept for backwards-compat with TrialBanner.
 * Delegates all rendering to UpgradePremiumModal.
 */
import { UpgradePremiumModal } from "@/modules/dashboard/UpgradePremiumModal";

interface PricingModalProps {
  onClose:   () => void;
  daysLeft?: number;
}

export function PricingModal({ onClose }: PricingModalProps) {
  return <UpgradePremiumModal open={true} onClose={onClose} />;
}
