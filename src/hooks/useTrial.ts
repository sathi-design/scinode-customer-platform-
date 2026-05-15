"use client";

import { useState, useEffect } from "react";

const TRIAL_DAYS      = 15;
const STORAGE_START   = "mfg_trial_start";
const STORAGE_DISMISS = "mfg_trial_banner_dismissed";

export interface TrialState {
  daysLeft:    number;
  hoursLeft:   number;
  minutesLeft: number;
  secondsLeft: number;
  isExpired:   boolean;
  trialEnd:    Date | null;
  dismissed:   boolean;
  dismiss:     () => void;
  expand:      () => void;
}

export function useTrial(): TrialState {
  const [trialStart, setTrialStart] = useState<Date | null>(null);
  const [now,        setNow]        = useState<Date>(new Date());
  const [dismissed,  setDismissed]  = useState(false);

  useEffect(() => {
    // Initialize or read trial start date
    let stored = localStorage.getItem(STORAGE_START);
    if (!stored) {
      stored = new Date().toISOString();
      localStorage.setItem(STORAGE_START, stored);
    }
    setTrialStart(new Date(stored));

    // Read dismiss state
    setDismissed(localStorage.getItem(STORAGE_DISMISS) === "true");

    // Tick every second for live countdown
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const trialEnd = trialStart
    ? new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    : null;

  const msLeft = trialEnd ? Math.max(0, trialEnd.getTime() - now.getTime()) : 0;

  const daysLeft    = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const hoursLeft   = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutesLeft = Math.floor((msLeft % (60 * 60 * 1000)) / 60_000);
  const secondsLeft = Math.floor((msLeft % 60_000) / 1_000);
  const isExpired   = trialStart !== null && msLeft === 0;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_DISMISS, "true");
  };

  const expand = () => {
    setDismissed(false);
    localStorage.setItem(STORAGE_DISMISS, "false");
  };

  return { daysLeft, hoursLeft, minutesLeft, secondsLeft, isExpired, trialEnd, dismissed, dismiss, expand };
}
