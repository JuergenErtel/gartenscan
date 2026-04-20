"use client";

const WAITLIST_KEY = "gartenscan:waitlist_emails:v1";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const waitlistStorage = {
  add(email: string): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(WAITLIST_KEY);
      const existing = raw ? (JSON.parse(raw) as string[]) : [];
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
      }
    } catch {
      // ignore localStorage errors (quota, private mode)
    }
  },

  all(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(WAITLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },
};

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function extractEmailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1).toLowerCase();
}
