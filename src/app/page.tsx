import Link from "next/link";
import { getAllBooks } from "@/lib/books";

export default function Home() {
  const books = getAllBooks();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Digital Library
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A collection of books presented as interactive flipbooks. Click on a
            book to start reading with realistic page-turning effects.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.id}`}
              className="group block"
            >
              <article className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Book spine effect */}
                <div className="h-64 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 flex items-center justify-center relative">
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-800 to-transparent"></div>
                  <div className="text-center p-6">
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {book.title}
                    </h2>
                    <p className="text-slate-300">{book.author}</p>
                    {book.year && (
                      <p className="text-slate-400 text-sm mt-1">{book.year}</p>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                    {book.description}
                  </p>

                  {book.tags && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <span className="text-sm font-medium">Read Now</span>
                    <svg
                      className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {books.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">
              No books available yet.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        <p>Books presented for educational purposes.</p>
      </footer>
    </div>
  );
}
