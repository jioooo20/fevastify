# Fevastify

Fevastify is a film and web series streaming platform inspired by services like Netflix, IDLix, Cineby, and others. Users can browse a film catalog, watch trailers, view detailed film information, and stream content directly.

> **Status:** Currently under active development — focusing on the admin panel for content management first. The user-facing streaming pages are coming soon.

## Features

### Admin Panel (In Progress)

- Admin dashboard with stats and data visualizations
- Full CRUD for films (title, synopsis, poster, trailer, year, duration, rating)
- Genre, tag, and director management
- Production house management
- Media file upload and management

### Streaming (Coming Soon)

- Homepage with featured content and personalized recommendations
- Search and filter films by genre, year, rating
- Film detail page with full info, trailer, and related titles
- Built-in video player for streaming
- Categories and content curation

### General

- Dark/light theme toggle
- Fully responsive UI
- Accessibility (WCAG)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | UI components (Radix + Tailwind) |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Recharts](https://recharts.org/) | Charting & data visualization |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Embla Carousel](https://www.embla-carousel.com/) | Carousel component |
| [ESLint](https://eslint.org/) | Linting & code quality |

## Project Structure

```
fevastify/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Layout & providers (AdminLayout, ThemeProvider)
│   ├── features/              # Feature modules
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── films/             # Film management & details
│   │   ├── genres/            # Genre management
│   │   ├── tags/              # Tag management
│   │   ├── directors/         # Director management
│   │   └── production_house/  # Production house management
│   ├── shared/                # Shared utilities & API helpers
│   ├── components/            # Reusable UI components (shadcn/ui)
│   └── lib/                   # Utility functions (cn, etc.)
├── components.json            # shadcn/ui configuration
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or pnpm

### Installation

```bash
git clone <repository-url>
cd fevastify
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for the backend API |

## Routes

### Admin

| Path | Page |
|------|------|
| `/admin/dashboard` | Admin dashboard |
| `/admin/films` | Film list |
| `/admin/films/:id` | Film detail/edit |
| `/admin/genres` | Genre management |
| `/admin/tags` | Tag management |
| `/admin/directors` | Director management |
| `/admin/production-house` | Production house management |

### Streaming (Coming Soon)

| Path | Page |
|------|------|
| `/` | Homepage — featured & recommended films |
| `/browse` | Browse full catalog |
| `/genre/:slug` | Films by genre |
| `/film/:slug` | Film detail & watch |
| `/search` | Search films |

## License

MIT
