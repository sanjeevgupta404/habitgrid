# CineVerse

CineVerse is a modern, production-ready web application for discovering, searching, comparing, and exploring Movies, TV Shows, and Web Series from around the world. Built with React 19, TypeScript, and Tailwind CSS, it offers a premium UI/UX inspired by leading platforms like Netflix and Letterboxd.

## 🚀 Features

- **Immersive Landing Page**: Hero banner with trending content and category-based carousels.
- **Global Search with Instant Suggestions**: Fast, debounced search across movies, TV shows, and people.
- **Deep Discovery**: Advanced filtering by genre, year, and popularity with a dedicated discover interface.
- **Comprehensive Details**: Metadata, trailers, cast, reviews, and similar recommendations for every title.
- **Enhanced Comparison Tool**: Side-by-side comparison of up to 3 titles including Ratings, Popularity, Runtime, Revenue/Seasons, Cast, and Awards.
- **AI Recommendations**: Personalized AI assistant for tailored movie and TV show suggestions using Gemini.
- **Full User Life-cycle Tracking**:
  - Favorites & Watchlist
  - Status Tracking: Watching, Plan to Watch, Completed
  - Watch History (Auto-tracked)
  - All data persisted via LocalStorage.
- **Responsive Design**: Mobile-first approach with smooth animations using Framer Motion.
- **Dark/Light Mode**: Full system and manual theme support with glassmorphism UI.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router 7
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons
- **State Management**: React Context API + Custom Hooks
- **Data Fetching**: Axios (TMDB API & OMDb API)
- **Quality**: ESLint, Prettier, Oxlint
- **Verification**: Playwright

## 📂 Project Structure

```
src/
├── api/          # Axios client configurations
├── components/   # Reusable UI & feature-specific components
│   ├── ai/       # AI Assistant interface
│   ├── home/     # Hero & Content sections
│   ├── layout/   # Navbar & Footer
│   └── ui/       # Atom components (Button, Card, etc.)
├── context/      # Global state providers
├── hooks/        # Custom React hooks (useAppContext, useUserContext)
├── layouts/      # Main page layouts
├── pages/        # Route-level page components
├── services/     # API service layers
├── types/        # TypeScript interfaces
└── utils/        # Utility functions (cn, etc.)
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/cineverse.git
    cd cineverse
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```env
    VITE_TMDB_API_KEY=your_tmdb_api_key
    VITE_OMDB_API_KEY=your_omdb_api_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```

### Production Build

To build the project for production:
```bash
npm run build
```

## 📄 License

This project is licensed under the MIT License.
