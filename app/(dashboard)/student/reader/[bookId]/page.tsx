"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ChevronUp } from "lucide-react";

const BOOK_CONFIG: Record<string, { title: string; pages: number; folder: string }> = {
  "dcet-2023": { title: "DCET 2023", pages: 45, folder: "dcet-2023" },
  "dcet-2024": { title: "DCET 2024", pages: 45, folder: "dcet-2024" },
  "dcet-2025": { title: "DCET 2025", pages: 49, folder: "dcet-2025" },
  "dcet-2026": { title: "DCET 2026", pages: 51, folder: "dcet-2026" },
  "dcet-complete": { title: "DCET 2023–2026 Complete", pages: 181, folder: "dcet-complete" },
};

export default function ReaderPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const book = BOOK_CONFIG[bookId as string];
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setShowScrollTop(container.scrollTop > 600);

    const images = Array.from(container.querySelectorAll<HTMLElement>("[data-page]"));
    const containerRect = container.getBoundingClientRect();
    const midpoint = containerRect.top + containerRect.height / 3;

    for (let i = 0; i < images.length; i++) {
      const rect = images[i].getBoundingClientRect();
      if (rect.top <= midpoint && rect.bottom > midpoint) {
        setCurrentPage(parseInt(images[i].dataset.page || "1"));
        break;
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-stone-400">
        Book not found
      </div>
    );
  }

  const pages = Array.from({ length: book.pages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h1 className="text-sm font-semibold text-white">{book.title}</h1>

        <span className="text-xs text-stone-500 tabular-nums min-w-[60px] text-right">
          {currentPage} / {book.pages}
        </span>
      </div>

      {/* Scrollable image container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-1">
          {pages.map((page) => (
            <LazyPage
              key={page}
              page={page}
              folder={book.folder}
              totalPages={book.pages}
            />
          ))}
        </div>

        {/* End marker */}
        <div className="text-center py-8 text-stone-600 text-xs">
          End of {book.title} · {book.pages} pages
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all z-20"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function LazyPage({ page, folder, totalPages }: { page: number; folder: string; totalPages: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const padded = String(page).padStart(totalPages > 99 ? 3 : 2, "0");
  const src = `/books/${folder}/page-${padded}.webp`;

  return (
    <div
      ref={ref}
      data-page={page}
      className="relative bg-stone-800/30 rounded overflow-hidden"
      style={{ minHeight: isVisible && loaded ? "auto" : "calc(150vw * 0.75)" }}
    >
      {isVisible && (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Page ${page} of ${totalPages}`}
            className={`w-full h-auto block transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            decoding="async"
          />
        </>
      )}
      {!isVisible && (
        <div className="absolute bottom-2 right-2 text-stone-600 text-xs">
          Page {page}
        </div>
      )}
    </div>
  );
}
