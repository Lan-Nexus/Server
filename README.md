# LAN Nexus Server

A comprehensive game management system for LAN parties and gaming communities. This full-stack application provides game library management, Steam integration, and game key distribution functionality.

## Features

- **Game Library Management**: Add, edit, and organize games with rich metadata
- **Steam Integration**: Import games directly from Steam with automatic metadata fetching
- **Game Key Management**: Distribute and track game keys for multiplayer sessions
- **Game Session Tracking**: Monitor and track gaming sessions with start/stop functionality
- **Live Dashboard**: Real-time dashboard for TV displays with auto-refresh every 30 seconds
- **Session Analytics**: View gaming statistics, popular games, and session history
- **Search & Discovery**: Find and add games from external sources
- **File Management**: Upload and manage game archives, images, and assets
- **Authentication**: JWT-based authentication with role-based permissions
- **Modern Web Interface**: Vue.js frontend with responsive design

## Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **TypeScript** - Type safety and development experience
- **MySQL** - Primary database with Drizzle ORM
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Steam API** - Game metadata integration

### Frontend
- **Vue.js 3** - Modern reactive framework
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vite** - Build tool and development server
- **TailwindCSS** with **DaisyUI** - Styling framework

### Infrastructure
- **Docker** - Containerized deployment
- **MySQL 8.0** - Database server
- **Adminer** - Database administration interface

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** and **Docker Compose**
- **Steam API Key** - [Get one here](https://steamcommunity.com/dev/apikey)
- **SteamGridDB API Key** - [Get one here](https://www.steamgriddb.com/profile/preferences/api)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="mysql://root:example@localhost:3306/mydatabase"

# Steam Integration
STEAM_API_KEY=your_steam_api_key_here
STEAM_USER_ID=your_steam_user_id_here

# SteamGridDB (for game artwork)
STEAM_GRID_ID_KEY=your_steamgriddb_api_key_here

# Server Configuration
PORT=3000

# Authentication (set these for production)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
AUTH_TIME=24h
```

### 3. Start with Docker

```bash
docker-compose up -d
```

This will start:
- **MySQL database** on port 3306
- **Adminer** database interface on port 8080
- **Application server** on port 3000

### 4. Database Setup

Generate and run database migrations:

```bash
npm run generate
npm run migrate
```

### 5. First Run Setup

When you first access the application, you'll be guided through a one-time setup process to create your admin account:

1. Navigate to `http://localhost:3000`
2. You'll automatically be redirected to the setup page
3. Fill in your admin user details:
   - Full name
   - Username (used for login)
   - Secure password
4. Click "Create Admin Account"
5. You'll be automatically logged in and can start using the system

> **Note**: The setup page is only accessible when no users exist in the system. Once an admin user is created, the setup process is disabled for security.

For more details about the setup process, see [SETUP.md](./SETUP.md).

### 6. Development

For development with hot reload:

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## Game Session Tracking

The application now includes comprehensive game session tracking capabilities:

### Features
- **Start/Stop Sessions**: Track when players start and stop playing games
- **Real-time Monitoring**: Live dashboard showing current active sessions
- **Session History**: Complete history of all gaming sessions
- **Analytics**: View popular games, session durations, and player activity
- **Auto-refresh Dashboard**: Perfect for TV displays with 30-second updates

### API Endpoints

The game session tracking provides a full REST API:

- `POST /api/game-sessions` - Start a new game session
- `POST /api/game-sessions/:id/stop` - Stop a specific session
- `POST /api/game-sessions/client/:clientId/stop` - Stop all sessions for a client
- `GET /api/game-sessions/active` - Get all active sessions
- `GET /api/game-sessions/client/:clientId` - Get session history for a client
- `GET /api/game-sessions/game/:gameId` - Get all sessions for a specific game

### Usage Example

```javascript
// Start a gaming session
const response = await fetch('/api/game-sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'player123',
    gameId: 5
  })
});

// Stop the session later
await fetch(`/api/game-sessions/${sessionId}/stop`, {
  method: 'POST'
});
```

### Dashboard Views

1. **Admin Sessions View** (`/game-sessions`): 
   - Manage all game sessions
   - View session statistics
   - Start/stop sessions manually
   - Filter and search sessions

2. **Live Dashboard** (`/dashboard`):
   - Real-time activity display
   - Perfect for TV screens
   - Auto-refreshes every 30 seconds
   - Shows active players, popular games, and recent activity

For detailed API documentation, see [GAME_TRACKER_API.md](./GAME_TRACKER_API.md).

## File Upload Support

The system supports uploading various game assets:
- **Game Archives** - Installation files and game packages
- **Icons** - Small game icons
- **Header Images** - Banner-style images
- **Logos** - Game logos
- **Image Cards** - Card-style promotional images
- **Hero Images** - Large promotional images

## Database Management

### Using Adminer
Access the database interface at `http://localhost:8080` with:
- **Server**: `mysql` (or `localhost`)
- **Username**: `root`
- **Password**: `example`
- **Database**: `mydatabase`

### Drizzle Commands
```bash
npm run generate     # Generate new migrations
npm run migrate      # Apply migrations
npm run generate:undo # Undo last migration
```

## Development Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run dev:info     # Run server info script
npm run dev:renderer # Start frontend development server

# Building
npm run build        # Build entire application
npm run build:server # Build server only
npm run build-only   # Build frontend only
npm run type-check   # Run TypeScript type checking

# Database
npm run generate     # Generate Drizzle migrations
npm run migrate      # Run database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
