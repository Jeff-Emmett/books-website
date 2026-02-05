import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getAllBooks } from "@/lib/books";
import BookViewer from "@/components/BookViewer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const books = getAllBooks();
  return books.map((book) => ({
    id: book.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = getBook(id);

  if (!book) {
    return {
      title: "Book Not Found",
    };
  }

  return {
    title: `${book.title} by ${book.author} | Digital Library`,
    description: book.description,
  };
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const book = getBook(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Library
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {book.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              by {book.author}
              {book.year && ` (${book.year})`}
            </p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Book viewer */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <BookViewer pdfUrl={book.pdfPath} title={book.title} />
        </div>
      </main>

      {/* Book info footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            About this book
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            {book.description}
          </p>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
