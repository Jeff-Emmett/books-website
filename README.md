# Digital Library - Interactive Book Flipbooks

A collection of books presented as interactive flipbooks with realistic page-turning effects. Built with Next.js, react-pageflip, and react-pdf.

## Features

- Interactive flipbook viewer with realistic page-turn animations
- Keyboard navigation (arrow keys)
- Mouse/touch swipe support
- Responsive design
- Dark mode support
- Docker deployment ready with Traefik labels

## Books

Currently available:
- **Amusing Ourselves to Death** by Neil Postman (1985)

## Adding New Books

1. Add the PDF file to `public/books/`
2. Update `src/lib/books.ts` with the book metadata:

```typescript
{
  id: "book-slug",
  title: "Book Title",
  author: "Author Name",
  description: "Book description...",
  pdfPath: "/books/filename.pdf",
  year: 2025,
  tags: ["tag1", "tag2"],
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

The project includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker compose up -d --build
```

The Traefik labels are configured for `books.jeffemmett.com`.

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [react-pageflip](https://github.com/nodlik/react-pageflip) - Page flip animations
- [react-pdf](https://github.com/wojtekmaj/react-pdf) - PDF rendering
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

Educational use only. Book contents are copyrighted by their respective authors.
