"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface CompetitionItem {
  _id:               string;
  name:              string;
  date:              string;
  description?:      string;
  whoCanParticipate: string;
  mainImage:         string;
  subImages:         string[];
  createdAt:         string;
}

function isUpcoming(date: string) {
  return new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Create Modal ─────────────────────────────────────────────── */
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name,              setName             ] = useState("");
  const [date,              setDate             ] = useState("");
  const [description,       setDescription      ] = useState("");
  const [whoCanParticipate, setWhoCanParticipate] = useState("");
  const [mainImage,         setMainImage        ] = useState<string>("");
  const [subImages,         setSubImages        ] = useState<string[]>([]);
  const [saving,            setSaving           ] = useState(false);
  const [error,             setError            ] = useState("");
  const mainRef = useRef<HTMLInputElement>(null);
  const subRef  = useRef<HTMLInputElement>(null);

  async function handleMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Main image must be under 3 MB."); return; }
    setMainImage(await fileToBase64(file));
  }

  async function handleSubImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.some((f) => f.size > 3 * 1024 * 1024)) { setError("Each sub image must be under 3 MB."); return; }
    const encoded = await Promise.all(files.map(fileToBase64));
    setSubImages((prev) => [...prev, ...encoded]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim())              { setError("Competition name is required."); return; }
    if (!date)                     { setError("Competition date is required."); return; }
    if (!whoCanParticipate.trim()) { setError("Participation eligibility is required."); return; }
    if (!mainImage)                { setError("Main image is required."); return; }

    setSaving(true);
    const res = await fetch("/api/admin/competitions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, date, description, whoCanParticipate, mainImage, subImages }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create competition.");
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#f1f5f9" }}>
          <div>
            <h2 className="text-lg font-black" style={{ color: "#1a3262" }}>Create Competition</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Fill in the competition details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100" style={{ color: "#94a3b8" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm font-semibold px-4 py-3 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Competition Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coding Hackathon 2026"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a3262")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Competition Date <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a3262")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Who Can Participate <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea value={whoCanParticipate} onChange={(e) => setWhoCanParticipate(e.target.value)}
              rows={3} placeholder="e.g. Open to all undergraduate students from Year 1 to Year 4…"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none"
              style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a3262")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Description <span style={{ color: "#94a3b8" }}>(optional)</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Describe the competition…"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none"
              style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a3262")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Main Image <span style={{ color: "#dc2626" }}>*</span>
              <span className="ml-1 font-normal" style={{ color: "#94a3b8" }}>(max 3 MB)</span>
            </label>
            <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer"
              style={{ borderColor: mainImage ? "#1a3262" : "#e2e8f0" }}
              onClick={() => mainRef.current?.click()}>
              {mainImage ? (
                <img src={mainImage} alt="preview" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Click to upload main image</span>
                </>
              )}
              <input ref={mainRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "#1a3262" }}>
              Sub Images <span style={{ color: "#94a3b8" }}>(optional, max 3 MB each)</span>
            </label>
            {subImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {subImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt={`sub-${i}`} className="w-16 h-16 object-cover rounded-lg" />
                    <button type="button" onClick={() => setSubImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#dc2626" }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => subRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-colors hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Sub Images
            </button>
            <input ref={subRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSubImages} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "#1a3262", color: "#e8a020" }}>
              {saving ? "Creating…" : "Create Competition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Competition Card ─────────────────────────────────────────── */
function CompetitionCard({ comp, onDelete }: { comp: CompetitionItem; onDelete: (id: string) => void }) {
  const upcoming = isUpcoming(comp.date);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/admin/competitions/${comp._id}`, { method: "DELETE" });
    onDelete(comp._id);
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md" style={{ borderColor: "#e2e8f0" }}>
      <div className="relative h-44 overflow-hidden">
        <img src={comp.mainImage} alt={comp.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
        <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={upcoming ? { background: "#dcfce7", color: "#166534" } : { background: "#f1f5f9", color: "#64748b" }}>
          {upcoming ? "Upcoming" : "Past"}
        </span>
        {comp.subImages.length > 0 && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)", color: "white" }}>
            +{comp.subImages.length} photos
          </span>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-black text-base drop-shadow">{comp.name}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="#e8a020" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-bold" style={{ color: "#1a3262" }}>{fmtDate(comp.date)}</span>
        </div>

        <div className="mb-2 px-3 py-2 rounded-xl" style={{ background: "#f8fafc" }}>
          <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>Who Can Participate</div>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#334155" }}>{comp.whoCanParticipate}</p>
        </div>

        {comp.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "#64748b" }}>{comp.description}</p>
        )}

        {comp.subImages.length > 0 && (
          <div className="flex gap-1.5 mb-3 overflow-hidden">
            {comp.subImages.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ))}
          </div>
        )}

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-red-50"
            style={{ borderColor: "#fecaca", color: "#dc2626" }}>
            Delete Competition
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 rounded-xl text-xs font-bold border"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              style={{ background: "#dc2626" }}>
              {deleting ? "Deleting…" : "Confirm Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* PAGE                                                           */
/* ══════════════════════════════════════════════════════════════ */
export default function CompetitionsPage() {
  const router   = useRouter();
  const [comps,     setComps    ] = useState<CompetitionItem[]>([]);
  const [loading,   setLoading  ] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/competitions");
    if (res.status === 403) { router.push("/login"); return; }
    setComps(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const upcoming = comps.filter((c) => isUpcoming(c.date));
  const past     = comps.filter((c) => !isUpcoming(c.date));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#1a3262" }}>Competitions</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>Create and manage university competitions.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: "#1a3262", color: "#e8a020" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Competition
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Competitions", value: comps.length,   color: "#1a3262" },
          { label: "Upcoming",           value: upcoming.length, color: "#059669" },
          { label: "Past",               value: past.length,     color: "#64748b" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-4" style={{ borderColor: "#e2e8f0" }}>
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "#1a3262" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : comps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed" style={{ borderColor: "#e2e8f0" }}>
          <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="#1a3262" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="font-bold mb-1" style={{ color: "#64748b" }}>No competitions yet</p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Create your first competition to get started.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: "#059669" }}>Upcoming Competitions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((c) => (
                  <CompetitionCard key={c._id} comp={c} onDelete={(id) => setComps((prev) => prev.filter((x) => x._id !== id))} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3 mt-4" style={{ color: "#64748b" }}>Past Competitions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((c) => (
                  <CompetitionCard key={c._id} comp={c} onDelete={(id) => setComps((prev) => prev.filter((x) => x._id !== id))} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}
