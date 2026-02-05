"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker - use cdnjs for better reliability
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
  { children?: React.ReactNode; title?: string; width?: number; height?: number }
>(({ children, title, width, height }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "100%",
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

// PDFPage component with forwardRef for react-pageflip
const PDFPage = forwardRef<
  HTMLDivElement,
  { pageNumber: number; width: number; height: number }
>(({ pageNumber, width, height }, ref) => {
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
      <Page
        pageNumber={pageNumber}
        width={width - 20}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        loading={
          <div
            style={{
              width: width - 20,
              height: height - 20,
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading page {pageNumber}...
          </div>
        }
        error={
          <div
            style={{
              width: width - 20,
              height: height - 20,
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
          >
            Error loading page {pageNumber}
          </div>
        }
      />
    </div>
  );
});
PDFPage.displayName = "PDFPage";

export default function PDFFlipbook({ pdfUrl, title }: PDFFlipbookProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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

        // Book aspect ratio (roughly 8.5:11 for letter size)
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

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      console.log("PDF loaded successfully, pages:", numPages);
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF load error:", err);
    setError(err.message);
    setIsLoading(false);
  }, []);

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

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
            <p className="text-slate-500">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center h-96 text-red-500 gap-2">
            <p>Failed to load PDF</p>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        }
      >
        {!isLoading && numPages > 0 && (
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

              {/* PDF pages */}
              {Array.from(new Array(numPages), (_, index) => (
                <PDFPage
                  key={`page_${index + 1}`}
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
      </Document>
    </div>
  );
}
