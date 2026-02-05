export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  pdfPath: string;
  coverImage?: string;
  year?: number;
  tags?: string[];
}

export const books: Book[] = [
  {
    id: "amusing-ourselves-to-death",
    title: "Amusing Ourselves to Death",
    author: "Neil Postman",
    description:
      "A prophetic look at what happens when politics, journalism, education, and even religion become subject to the demands of entertainment. Originally published in 1985, this book remains incredibly relevant in the age of social media and constant digital distraction.",
    pdfPath: "/books/amusing-ourselves-to-death.pdf",
    year: 1985,
    tags: ["media criticism", "society", "technology", "culture"],
  },
  {
    id: "interference",
    title: "Interference: A Grand Scientific Musical Theory",
    author: "Richard Merrick",
    description:
      "A groundbreaking exploration of Harmonic Interference Theory - a set of principles explaining music perception using the physics of harmonic standing waves. The book reveals how harmonics combine to form coherent geometrical patterns that our auditory system recognizes, connecting music theory to cymatics, Fibonacci sequences, and the fundamental patterns found throughout nature.",
    pdfPath: "/books/interference.pdf",
    year: 2009,
    tags: ["music theory", "harmonics", "cymatics", "science", "perception"],
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getAllBooks(): Book[] {
  return books;
}
