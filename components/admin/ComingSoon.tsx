interface Props {
  title:   string;
  desc:    string;
  icon:    React.ReactNode;
  accent?: string;
}

export default function ComingSoon({ title, desc, icon, accent = "#1a3262" }: Props) {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header strip */}
      <div className="mb-8">
        <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>{title}</h1>
        <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{desc}</p>
      </div>

      {/* Coming soon card */}
      <div
        className="flex flex-col items-center justify-center rounded-3xl border bg-white py-24 px-8 text-center"
        style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        {/* Icon circle */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: `${accent}12`, color: accent }}
        >
          {icon}
        </div>

        <div
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border"
          style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          Coming Soon
        </div>

        <h2 className="text-2xl font-black mb-2" style={{ color: "#1a3262" }}>Under Construction</h2>
        <p className="text-sm max-w-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          The <strong style={{ color: "#1a3262" }}>{title}</strong> module is currently being built.
          Content and functionality will be available here soon.
        </p>

        {/* Decorative progress */}
        <div className="mt-8 w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
          <div
            className="h-full rounded-full"
            style={{ width: "35%", background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
          />
        </div>
        <p className="text-[10px] mt-2 font-semibold" style={{ color: "#cbd5e1" }}>35% complete</p>
      </div>
    </div>
  );
}
