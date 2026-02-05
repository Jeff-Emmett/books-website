"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with react-pdf
const PDFFlipbook = dynamic(() => import("@/components/PDFFlipbook"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
  ),
});

interface BookViewerProps {
  pdfUrl: string;
  title: string;
}

export default function BookViewer({ pdfUrl, title }: BookViewerProps) {
  return <PDFFlipbook pdfUrl={pdfUrl} title={title} />;
}
