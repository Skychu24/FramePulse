<<<<<<< HEAD
# FramePulse
A website to host a catalogue of screen recordings of our classes to share with my batchmates
=======
# CCNA Screen Recording Catalogue - Cyber-Noir Edition

A professional MERN application showcasing CCNA screen recordings with a mature Cyber-Noir aesthetic.

## 🎨 Design Features

- **Cyber-Noir Theme**: Obsidian (#0B0B0B) backgrounds, Gunmetal cards, and Deep Crimson (#8B0000) accents
- **Anime.js Animations**: Staggered slide-up entrances and subtle glow-pulse effects
- **Responsive Design**: Mobile-first approach with modern UI components

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom Cyber-Noir theme
- **Anime.js** - Smooth animations and transitions
- **Lucide React** - Modern icon library
- **Radix UI** - Accessible component primitives

### Backend
- **Express.js** - RESTful API server
- **MongoDB** - NoSQL database with Mongoose ODM
- **Traffic Controller** - Session management with 50 concurrent user limit
- **User Schema** - Personal view history tracking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/ccna-catalog
PORT=5000

# Start development server
npm run dev
```

## 🎯 Features

### Traffic Management
- **Concurrent Session Limit**: Maximum 50 active users
- **Queue System**: Graceful handling when server is at capacity
- **Session Cleanup**: Automatic cleanup of expired sessions (5-minute timeout)

### User Experience
- **Personal History**: Track viewed videos and progress
- **Advanced Search**: Filter by subject, date, and instructor
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Professional transitions and micro-interactions

### Cyber-Noir Styling
- **Color Palette**: 
  - Obsidian (#0B0B0B) - Primary background
  - Gunmetal (#2C3E50) - Card backgrounds
  - Deep Crimson (#8B0000) - Primary accent
  - Steel (#4A5568) - Secondary elements
- **Animated Background**: Subtle gradient orbs and scanline effects
- **Corner Decorations**: Animated corner elements for visual interest

## 📚 API Endpoints

### Videos
- `GET /api/videos` - Get all videos with optional filtering
- `GET /api/health` - Server health check
- `GET /api/stats` - Platform statistics

### Users
- `GET /api/user/:email` - Get user profile with view history
- `POST /api/user` - Create or update user
- `POST /api/user/:email/view-history` - Add video to view history
- `GET /api/user/:email/view-history` - Get user's view history

## 🎬 Animation System

The application includes a comprehensive animation system:

### Video Cards
- **Staggered Entrance**: Cards slide up with staggered timing
- **Hover Effects**: Scale and glow animations on interaction
- **Smooth Transitions**: All state changes are animated

### Background Elements
- **Gradient Orbs**: Floating background elements with subtle movement
- **Scanline Effect**: Retro CRT monitor effect
- **Corner Decorations**: Animated corner elements

## 🔧 Development

### Project Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── video-card.tsx  # Video card component
│   ├── video-catalog.tsx # Main catalog
│   └── video-row.tsx   # Horizontal video rows
├── lib/                # Utilities
│   ├── animations.js   # Anime.js animation utilities
│   └── utils.ts        # General utilities
├── server/             # Express.js backend
│   ├── index.js        # Main server file
│   └── package.json    # Backend dependencies
└── styles/             # Global styles
```

### Customizing Animations
Animations are defined in `/lib/animations.js`:

```javascript
// Initialize video card animations
initializeVideoCardAnimations('.video-card');

// Animate background elements
animateBackgroundElements();

// Animate corner decorations
animateCornerDecorations();
```

## 🚀 Deployment

### Frontend (Vercel Recommended)
1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Render Recommended)
1. Deploy the `/server` directory
2. Set MongoDB connection string
3. Configure CORS for frontend domain

## 📊 Traffic Management

The backend includes intelligent traffic management:

- **Session Tracking**: Each IP address is tracked as a session
- **Automatic Cleanup**: Sessions expire after 5 minutes of inactivity
- **Queue System**: Users receive estimated wait times when server is full
- **Graceful Degradation**: 503 responses with helpful information

## 🎨 Cyber-Noir Design System

### Typography
- **Display Font**: Orbitron (futuristic, technical)
- **Body Font**: Inter (clean, readable)

### Color Usage
- **Primary Actions**: Deep Crimson (#8B0000)
- **Secondary Elements**: Steel (#4A5568)
- **Backgrounds**: Obsidian (#0B0B0B)
- **Cards**: Gunmetal (#2C3E50)
- **Text**: Various shades of gray for hierarchy

### Animation Principles
- **Subtle Movement**: Avoid jarring animations
- **Purposeful Motion**: Every animation serves a function
- **Performance First**: Hardware-accelerated transforms
- **Accessibility**: Respect `prefers-reduced-motion`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for the CCNA community**
>>>>>>> 410ef41 (feat: initial production-ready monorepo for FramePulse)
