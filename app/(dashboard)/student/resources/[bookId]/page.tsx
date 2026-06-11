"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, AlertCircle, Layers,
  CalendarDays, FileQuestion, ChevronRight, Lock, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const books: Record<
  string,
  { title: string; year: string; questions: number; file: string; featured: boolean; accent: string }
> = {
  "dcet-2023":               { title: "DCET 2023",             year: "2023",      questions: 100, file: "DCET-2023-Wintrix-Academy.pdf",              featured: false, accent: "#3b82f6" },
  "dcet-2024":               { title: "DCET 2024",             year: "2024",      questions: 100, file: "DCET-2024-Wintrix-Academy.pdf",              featured: false, accent: "#a855f7" },
  "dcet-2025":               { title: "DCET 2025",             year: "2025",      questions: 100, file: "DCET-2025-Wintrix-Academy.pdf",              featured: false, accent: "#10b981" },
  "dcet-2026":               { title: "DCET 2026",             year: "2026",      questions: 100, file: "DCET-2026-Wintrix-Academy.pdf",              featured: false, accent: "#f59e0b" },
  "dcet-2023-2026-complete": { title: "Complete Collection",   year: "2023–2026", questions: 400, file: "DCET-2023-2026-Complete-Wintrix-Academy.pdf", featured: true,  accent: "#f59e0b" },
};

const allBooks = Object.entries(books).map(([id, b]) => ({ id, ...b }));

export default function BookViewerPage() {
  const params   = useParams();
  const bookId   = params?.bookId as string;
  const book     = books[bookId];
  const wrapRef  = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded]   = useState(false);
  const [errored, setErrored] = useState(false);

  // Block right-click on the viewer wrapper
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const prevent = (e: MouseEvent) => e.preventDefault();
    el.addEventListener("contextmenu", prevent);
    return () => el.removeEventListener("contextmenu", prevent);
  }, []);

  // Reset loading state when book changes
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [bookId]);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-stone-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Book not found</h2>
          <p className="text-stone-500 text-sm">This paper doesn&apos;t exist in our library.</p>
        </div>
        <Link href="/student/resources">
          <Button variant="outline" className="border-stone-700 text-stone-300 hover:text-white">
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const pdfSrc = `/books/${book.file}#toolbar=0&navpanes=0&view=FitH`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] -m-4 -mt-4 lg:-m-8 lg:-mt-8">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 h-12 bg-stone-950 border-b border-stone-800/80 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/student/resources">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-stone-400 hover:text-white hover:bg-stone-800 gap-1.5 flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Library</span>
            </Button>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: book.accent }} />
            <span className="font-medium text-white text-sm truncate max-w-[160px] sm:max-w-xs">{book.title}</span>
            {book.featured && (
              <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0"
                style={{ background: "#f59e0b15", color: "#f59e0b", borderColor: "#f59e0b30" }}>
                Complete
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-stone-500 flex-shrink-0">
          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{book.year}</span>
          <span className="flex items-center gap-1"><FileQuestion className="w-3 h-3" />{book.questions} Q</span>
          <span className="flex items-center gap-1 text-stone-600"><Lock className="w-3 h-3" />Protected</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-52 border-r border-stone-800/80 bg-stone-950 flex-shrink-0">
          <div className="px-4 py-3 border-b border-stone-800/60">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-500 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />All Papers
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {allBooks.map((b) => {
              const isActive = b.id === bookId;
              return (
                <Link key={b.id} href={`/student/resources/${b.id}`}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isActive ? "bg-stone-800/60" : "hover:bg-stone-900"}`}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.accent }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-stone-400"}`}>{b.title}</p>
                      <p className="text-[10px] text-stone-600">{b.questions} Q</p>
                    </div>
                    {isActive && <div className="w-1 h-4 rounded-full bg-amber-500 flex-shrink-0" />}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-stone-800/60">
            <div className="flex items-center gap-1.5 text-stone-600 text-[10px]">
              <Layers className="w-3 h-3" />
              <span>5 papers · 500 questions</span>
            </div>
          </div>
        </div>

        {/* PDF area */}
        <div ref={wrapRef} className="flex-1 relative bg-stone-900 min-w-0" onContextMenu={(e) => e.preventDefault()}>

          {/* Loading overlay — shown until iframe fires onLoad */}
          {!loaded && !errored && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-stone-400 text-sm">Loading {book.title}…</p>
              <p className="text-stone-600 text-xs">This may take a few seconds on first load</p>
            </div>
          )}

          {/* Error state */}
          {errored && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900 z-10">
              <AlertCircle className="w-8 h-8 text-stone-500" />
              <p className="text-stone-400 text-sm">Could not load the PDF.</p>
              <button
                onClick={() => { setErrored(false); setLoaded(false); }}
                className="text-xs text-amber-500 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <iframe
            key={bookId}
            src={pdfSrc}
            className="w-full h-full border-0 block"
            title={book.title}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
          />
        </div>
      </div>
    </div>
  );
}
