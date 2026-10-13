type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-[#F1F5F9] text-text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
  info:    "bg-info/10 text-info",
  brand:   "bg-brand-violet/20 text-[#6B21A8]",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}