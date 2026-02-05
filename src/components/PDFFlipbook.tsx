"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { pdfjs } from "react-pdf";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PDFFlipbookProps {
  pdfUrl: string;
  title: string;
}

interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
  };
}

// PageCover component with forwardRef for react-pageflip
const PageCover = forwardRef<
  HTMLDivElement,
  { children?: React.ReactNode; title?: string; width: number; height: number }
>(({ children, title, width, height }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "white", padding: "2rem" }}>
        {title && (
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
});
PageCover.displayName = "PageCover";

// ImagePage component with forwardRef for react-pageflip
const ImagePage = forwardRef<
  HTMLDivElement,
  { src: string; pageNumber: number; width: number; height: number }
>(({ src, pageNumber, width, height }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={`Page ${pageNumber}`}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          Loading page {pageNumber}...
        </div>
      )}
    </div>
  );
});
ImagePage.displayName = "ImagePage";

export default function PDFFlipbook({ pdfUrl, title }: PDFFlipbookProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 550 });
  const bookRef = useRef<FlipBookRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate book dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = window.innerHeight - 200;

        const aspectRatio = 0.77;
        let pageWidth = Math.min(containerWidth / 2 - 40, 500);
        let pageHeight = pageWidth / aspectRatio;

        if (pageHeight > containerHeight - 40) {
          pageHeight = containerHeight - 40;
          pageWidth = pageHeight * aspectRatio;
        }

        setDimensions({
          width: Math.floor(pageWidth),
          height: Math.floor(pageHeight),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Load PDF and render pages to images
  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);

        // Load the PDF document
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        setNumPages(pdf.numPages);
        const images: string[] = [];

        // Render each page to canvas and convert to image
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;

          const page = await pdf.getPage(i);
          const scale = 2; // Higher scale for better quality
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Could not get canvas context");
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // @ts-expect-error - pdfjs types are overly strict
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert canvas to data URL
          const imageUrl = canvas.toDataURL("image/jpeg", 0.85);
          images.push(imageUrl);

          setLoadingProgress(Math.round((i / pdf.numPages) * 100));
        }

        if (cancelled) return;

        setPageImages(images);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("PDF load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setIsLoading(false);
      }
    }

    loadPDF();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const flipPrev = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const flipNext = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        flipPrev();
      } else if (e.key === "ArrowRight") {
        flipNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
        <p className="text-slate-600">Loading PDF... {loadingProgress}%</p>
        <div className="w-64 bg-slate-200 rounded-full h-2">
          <div
            className="bg-slate-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center h-96 text-red-500 gap-2">
        <p>Failed to load PDF</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {pageImages.length > 0 && (
        <>
          {/* @ts-expect-error - HTMLFlipBook types don't match exactly */}
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            size="stretch"
            minWidth={300}
            maxWidth={600}
            minHeight={400}
            maxHeight={800}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="shadow-2xl"
            ref={bookRef}
            flippingTime={600}
            usePortrait={false}
            startPage={0}
            drawShadow={true}
            maxShadowOpacity={0.5}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {/* Cover page */}
            <PageCover
              title={title}
              width={dimensions.width}
              height={dimensions.height}
            >
              <p style={{ color: "#cbd5e1", fontSize: "0.875rem", marginTop: "1rem" }}>
                Click or swipe to turn pages
              </p>
            </PageCover>

            {/* PDF pages as images */}
            {pageImages.map((src, index) => (
              <ImagePage
                key={`page_${index + 1}`}
                src={src}
                pageNumber={index + 1}
                width={dimensions.width}
                height={dimensions.height}
              />
            ))}

            {/* Back cover */}
            <PageCover
              title="End"
              width={dimensions.width}
              height={dimensions.height}
            >
              <p style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                Thank you for reading
              </p>
            </PageCover>
          </HTMLFlipBook>

          {/* Navigation controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={flipPrev}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              disabled={currentPage === 0}
            >
              Previous
            </button>

            <span className="text-slate-600 dark:text-slate-300">
              Page {currentPage + 1} of {numPages + 2}
            </span>

            <button
              onClick={flipNext}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              disabled={currentPage >= numPages + 1}
            >
              Next
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-2">
            Use arrow keys or click page edges to navigate
          </p>
        </>
      )}
    </div>
  );
}
