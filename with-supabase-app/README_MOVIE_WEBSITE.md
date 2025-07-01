# MovieFlix - Modern Movie Discovery Website

A beautiful, modern movie discovery website built with Next.js, shadcn/ui, and TMDB API integration.

## Features

### Core Features
- 🎬 **Movie Discovery**: Browse popular, top-rated, now playing, and upcoming movies
- 🔍 **Advanced Search**: Search movies by title with real-time results
- 🏷️ **Genre Filtering**: Filter movies by genres with dynamic badges
- ⭐ **Favorites System**: Save favorite movies with local storage persistence
- 📚 **Custom Collections**: Create and manage personalized movie collections
- 🔄 **Spoiler Toggle**: Switch between spoiler-free and detailed movie summaries

### UI/UX Features
- 🎨 **Modern Design**: Clean, responsive interface with Indigo (#6366F1) accent color
- 🌓 **Dark/Light Mode**: Seamless theme switching
- 📱 **Mobile-First**: Fully responsive design for all screen sizes
- ✨ **Smooth Animations**: CSS transitions and hover effects
- 🖼️ **Lazy Loading**: Optimized image loading with placeholders
- ♿ **Accessibility**: WCAG compliant with semantic HTML

### Technical Features
- ⚡ **Next.js 14**: App Router, Server Components, and TypeScript
- 🎯 **shadcn/ui**: Modern component library with Tailwind CSS
- 🎞️ **TMDB Integration**: Comprehensive movie data from The Movie Database
- 💾 **Local Storage**: Client-side data persistence for favorites and collections
- 🔗 **Shareable Collections**: Generate URLs to share movie collections

## Setup Instructions

### 1. Install Dependencies

```bash
# Install core dependencies (Motion animations)
npm install motion

# Install additional shadcn components if needed
pnpm dlx shadcn@latest add navigation-menu sheet dialog avatar badge scroll-area separator
```

### 2. TMDB API Setup

1. Go to [TMDB API](https://www.themoviedb.org/settings/api)
2. Create an account if you don't have one
3. Request an API key
4. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Project Structure

```
├── app/
│   ├── page.tsx                 # Homepage with movie discovery
│   ├── movie/[id]/page.tsx      # Individual movie details
│   ├── favorites/page.tsx       # User's favorite movies
│   ├── collections/page.tsx     # Movie collections management
│   └── globals.css              # Global styles with custom animations
├── components/
│   ├── navigation.tsx           # Responsive navigation bar
│   ├── movie-card.tsx          # Movie card with hover effects
│   ├── movie-grid.tsx          # Responsive movie grid layout
│   └── ui/                     # shadcn/ui components
└── lib/
    ├── types.ts                # TypeScript type definitions
    ├── tmdb.ts                 # TMDB API client
    └── storage.ts              # Local storage utilities
```

## Key Components

### Navigation
- Responsive header with search functionality
- Theme switcher for dark/light mode
- Mobile-friendly hamburger menu

### Movie Card
- Hover animations with scale and overlay effects
- Favorite button with heart icon
- Genre badges and rating display
- Optimized image loading

### Movie Details Page
- Hero section with backdrop image
- Spoiler toggle for plot summaries
- Cast information with profile photos
- Similar movies recommendations
- External links (IMDB, official website)

### Collections System
- Create custom movie collections
- Add/remove movies from collections
- Share collections via unique URLs
- Local storage persistence

## Color Scheme

The website uses a carefully crafted color palette:
- **Primary**: Indigo (#6366F1) - Used for accent colors and CTAs
- **Background**: Dynamic (white/dark) based on theme
- **Text**: High contrast ratios for accessibility
- **Muted**: Subtle colors for secondary information

## Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Local Storage**: Client-side caching for favorites and collections
- **API Caching**: Smart caching of TMDB API responses
- **Responsive Images**: Multiple image sizes for different screen densities

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Future Enhancements

Potential features to add:
- User authentication with Supabase
- Movie reviews and ratings
- Watchlist functionality
- Social sharing features
- Advanced filtering options
- Movie trailers embedded viewing
- Recommendation engine
- PWA capabilities

## API Rate Limits

TMDB API has rate limits:
- 40 requests per 10 seconds
- The application handles these gracefully with error boundaries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. TMDB API usage follows their terms of service. 