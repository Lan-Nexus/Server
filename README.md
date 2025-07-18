# LAN Nexus Server

A comprehensive game management system for LAN parties and gaming communities. This full-stack application provides game library management, Steam integration, and game key distribution functionality.

## Features

- **Game Library Management**: Add, edit, and organize games with rich metadata
- **Steam Integration**: Import games directly from Steam with automatic metadata fetching
- **Game Key Management**: Distribute and track game keys for multiplayer sessions
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

### 5. Development

For development with hot reload:

```bash
npm run dev
```

Access the application at `http://localhost:3000`

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
