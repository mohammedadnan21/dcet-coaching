"use client";

import { BookOpen, ArrowRight, Layers, CalendarDays, FileQuestion, Lock } from "lucide-react";

const books = [
  {
    id: "dcet-2023",
    year: "2023",
    title: "DCET 2023",
    questions: 100,
    file: "DCET-2023-Wintrix-Academy.pdf",
    featured: false,
    spineColor: "#1d4ed8",
    coverAccent: "#3b82f6",
    label: null,
    useReader: true,
  },
  {
    id: "dcet-2024",
    year: "2024",
    title: "DCET 2024",
    questions: 100,
    file: "DCET-2024-Wintrix-Academy.pdf",
    featured: false,
    spineColor: "#7c3aed",
    coverAccent: "#a855f7",
    label: null,
    useReader: true,
  },
  {
    id: "dcet-2025",
    year: "2025",
    title: "DCET 2025",
    questions: 100,
    file: "DCET-2025-Wintrix-Academy.pdf",
    featured: false,
    spineColor: "#047857",
    coverAccent: "#10b981",
    label: null,
    useReader: true,
  },
  {
    id: "dcet-2026",
    year: "2026",
    title: "DCET 2026",
    questions: 100,
    file: "DCET-2026-Wintrix-Academy.pdf",
    featured: false,
    spineColor: "#b45309",
    coverAccent: "#f59e0b",
    label: "Latest",
    useReader: true,
  },
];

const featuredBook = {
  id: "dcet-2023-2026-complete",
  year: "2023–2026",
  title: "Complete Collection",
  subtitle: "All 4 Years · 400 Questions",
  questions: 400,
  file: "DCET-2023-2026-Complete-Wintrix-Academy.pdf",
};

function BookCover({
  year,
  spineColor,
  coverAccent,
  label,
}: {
  year: string;
  spineColor: string;
  coverAccent: string;
  label?: string | null;
}) {
  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: 80, height: 110 }}>
      {/* Spine */}
      <div
        className="absolute left-0 top-0 h-full rounded-l-sm"
        style={{ width: 10, background: spineColor, opacity: 0.9 }}
      />
      {/* Cover */}
      <div
        className="absolute inset-0 rounded-r-sm rounded-l-none ml-[10px] flex flex-col justify-between p-2 overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${coverAccent}22 0%, #1c191700 100%)`, border: `1px solid ${coverAccent}30`, borderLeft: "none" }}
      >
        {/* Top decoration lines */}
        <div className="space-y-1">
          <div className="h-0.5 rounded-full w-full" style={{ background: `${coverAccent}60` }} />
          <div className="h-0.5 rounded-full w-3/4" style={{ background: `${coverAccent}30` }} />
        </div>
        {/* Year label */}
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: coverAccent }}>DCET</p>
          <p className="text-lg font-bold text-white leading-none">{year}</p>
        </div>
        {/* Bottom logo line */}
        <div className="h-0.5 rounded-full w-full" style={{ background: `${coverAccent}40` }} />
        {label && (
          <div
            className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1 py-0.5 rounded"
            style={{ background: coverAccent, color: "#0c0a09" }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedCover() {
  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: 100, height: 138 }}>
      {/* Spine */}
      <div className="absolute left-0 top-0 h-full rounded-l-sm" style={{ width: 13, background: "#92400e" }} />
      {/* Cover */}
      <div
        className="absolute inset-0 ml-[13px] rounded-r flex flex-col justify-between p-3 overflow-hidden"
        style={{ background: "#1c1917", border: "1px solid #f59e0b30", borderLeft: "none" }}
      >
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }}
        />
        <div className="relative space-y-1">
          <div className="h-0.5 rounded-full bg-amber-500" />
          <div className="h-0.5 rounded-full bg-amber-500/40 w-2/3" />
        </div>
        <div className="relative text-center">
          <p className="text-[9px] font-bold tracking-widest text-amber-400 uppercase">Wintrix</p>
          <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">DCET</p>
          <p className="text-xl font-black text-white leading-none">2023</p>
          <p className="text-xs font-light text-amber-200/60">–2026</p>
        </div>
        <div className="relative h-0.5 rounded-full bg-amber-500/50" />
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-500">Study Materials</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          DCET Question Papers
        </h1>
        <p className="text-stone-400 mt-2 text-sm md:text-base max-w-lg">
          Previous year papers from 2023 to 2026. Read directly in the browser — secure and exclusive to Wintrix Academy students.
        </p>
      </div>

      {/* ── Stats strip ────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-stone-800 border border-stone-800 rounded-xl overflow-hidden bg-stone-900/50">
        {[
          { icon: Layers, label: "Total Papers", value: "5" },
          { icon: FileQuestion, label: "Total Questions", value: "500" },
          { icon: CalendarDays, label: "Years Covered", value: "2023–2026" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-4">
            <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-base leading-tight">{value}</p>
              <p className="text-stone-500 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Featured — Complete Collection ─────────── */}
      <section>
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-4">Featured</p>
        <a href="/student/reader/dcet-complete">
          <div className="group relative rounded-2xl border border-amber-800/30 bg-stone-900 hover:border-amber-600/50 hover:bg-stone-900/80 transition-all duration-200 overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-px bg-amber-500/40" />

            <div className="flex items-center gap-6 p-6 md:p-8">
              <FeaturedCover />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                    Complete Collection
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {featuredBook.title}
                </h2>
                <p className="text-stone-400 text-sm mb-4">{featuredBook.subtitle}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
                    <span>{featuredBook.year}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <FileQuestion className="w-3.5 h-3.5 text-stone-500" />
                    <span><span className="font-semibold text-white">{featuredBook.questions}</span> Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                    <span>4 Years Combined</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-amber-400 group-hover:translate-x-1 transition-transform duration-150 flex-shrink-0">
                <span className="text-sm font-medium">Open</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </a>
      </section>

      {/* ── Individual Year Papers ──────────────────── */}
      <section>
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-4">Year-wise Papers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <a key={book.id} href={book.useReader ? `/student/reader/${book.id}` : `/books/${book.file}#toolbar=0&navpanes=0`} target={book.useReader ? undefined : "_blank"} rel={book.useReader ? undefined : "noopener noreferrer"}>
              <div
                className="group relative rounded-xl border bg-stone-900 hover:bg-stone-900/80 transition-all duration-200 overflow-hidden h-full flex flex-col cursor-pointer"
                style={{ borderColor: `${book.coverAccent}20` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${book.coverAccent}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${book.coverAccent}20`;
                }}
              >
                {/* Top accent line */}
                <div className="h-px w-full" style={{ background: book.coverAccent, opacity: 0.4 }} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-5">
                    <BookCover
                      year={book.year}
                      spineColor={book.spineColor}
                      coverAccent={book.coverAccent}
                      label={book.label}
                    />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${book.coverAccent}15` }}>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: book.coverAccent }} />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-bold text-white text-base mb-0.5">{book.title}</h3>
                    <p className="text-stone-500 text-xs mb-3">Previous Year Questions</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: book.coverAccent }}>
                        {book.questions} Questions
                      </span>
                      {book.label && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${book.coverAccent}20`, color: book.coverAccent }}>
                          {book.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer note ────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 text-stone-600 text-xs pt-2">
        <Lock className="w-3 h-3" />
        <span>Exclusive to Wintrix Academy students · Downloading or sharing is not permitted</span>
      </div>
    </div>
  );
}
