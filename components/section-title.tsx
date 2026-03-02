interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-10 max-w-3xl">
      <h2 className="text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-lg text-white/70">{subtitle}</p> : null}
    </div>
  );
}
