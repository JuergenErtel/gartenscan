import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
}

export function OnboardingHeadline({ title, subtitle, className }: Props) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="font-serif text-[28px] leading-[1.1] text-forest-900 mb-2 font-normal tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[15px] leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
