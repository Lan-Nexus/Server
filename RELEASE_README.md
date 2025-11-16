# LAN Nexus Server - Release Package

Welcome! This is the production-ready build of LAN Nexus Server.

## 📦 What's Included

This package contains everything you need to run LAN Nexus Server:

- ✅ Compiled server application
- ✅ Production dependencies configuration
- ✅ Database migration files
- ✅ Automated database updater
- ✅ Docker configuration
- ✅ Environment template

## 🚀 Quick Start

### First Time Installation

```bash
# 1. Extract the package
unzip server-build.zip -d lan-nexus

# 2. Navigate to the directory
cd lan-nexus

# 3. Install dependencies
npm ci --omit=dev

# 4. Configure environment
cp .env .env
# Edit .env with your database credentials and API keys

# 5. Run the installer (sets up database)
npm run install

# 6. Start the server
node index.js
```

The server will be available at `http://localhost:3000` (or your configured port).

### Updating from Previous Version

```bash
# 1. Backup your database first!
mysqldump -u root -p lan_nexus > backup.sql

# 2. Extract this package
unzip server-build.zip -d lan-nexus-update

# 3. Navigate to the directory
cd lan-nexus-update

# 4. Install dependencies
npm ci --omit=dev

# 5. Copy your existing .env file
cp /path/to/old/.env .env

# 6. Run the database updater
npm run update

# 7. Start the server
node index.js
```

📖 **See UPDATE.md for detailed update instructions and troubleshooting**

## 📋 Requirements

- **Node.js**: v20 or higher (v22 recommended)
- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **Memory**: 512MB RAM minimum (1GB recommended)
- **Storage**: 500MB free space (plus space for game files)

## ⚙️ Configuration

Edit the `.env` file with your settings:

### Required Variables

```env
# Database connection
DATABASE_URL=mysql://user:password@host:port/database

# Server configuration
PORT=3000
PROTOCOL=http

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
AUTH_TIME=24

# Steam API (for game metadata)
STEAM_API_KEY=your-steam-api-key
STEAM_USER_ID=your-steam-id

# SteamGridDB (for game artwork)
STEAM_GRID_ID_KEY=your-steamgrid-api-key
```

### Getting API Keys

- **Steam API Key**: https://steamcommunity.com/dev/apikey
- **Steam User ID**: https://steamid.io/
- **SteamGridDB Key**: https://www.steamgriddb.com/profile/preferences/api

## 🛠️ Available Commands

```bash
# Start the server (production)
node index.js

# Run initial installation
npm run install

# Update database schema
npm run update

# View database in browser
npm run studio
```

## 🐳 Docker Deployment

This package includes a Dockerfile for containerized deployment:

```bash
# Build the image
docker build -t lan-nexus .

# Run the container
docker run -d \
  --name lan-nexus \
  -p 3000:3000 \
  -v $(pwd)/.env:/app/.env \
  lan-nexus
```

Or use with Docker Compose (create `docker-compose.yml`):

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/lan_nexus
    depends_on:
      - db
    volumes:
      - ./public/uploads:/app/public/uploads
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=lan_nexus
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 📁 Directory Structure

```
lan-nexus/
├── index.js              # Main server entry point
├── package.json          # Dependencies and scripts
├── .env                  # Environment configuration (you create this)
├── drizzle/              # Database migration files
│   ├── meta/
│   └── *.sql
├── drizzle.config.ts     # Drizzle ORM configuration
├── update.ts             # Database updater script
├── install.ts            # Initial installation script
├── Dockerfile            # Docker configuration
├── UPDATE.md             # Detailed update guide
└── public/               # Static files and uploads
```

## 🔒 Security Notes

1. **Change default secrets**: Generate a secure `JWT_SECRET`
2. **Protect your .env**: Never commit it to version control
3. **Database security**: Use strong database passwords
4. **Firewall rules**: Only expose necessary ports
5. **Regular updates**: Keep the server updated

## 📊 Database Management

### View Database Schema

```bash
npm run studio
```

This opens Drizzle Studio in your browser at `http://localhost:4983`

### Manual Migrations

```bash
# Check migration status
npx drizzle-kit migrate

# Generate new migrations (if you have the source code)
npx drizzle-kit generate
```

### Backup Database

```bash
# Create backup
mysqldump -u root -p lan_nexus > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u root -p lan_nexus < backup_20240115.sql
```

## 🐛 Troubleshooting

### Server Won't Start

1. Check `.env` file exists and is configured
2. Verify database is running and accessible
3. Check logs for error messages
4. Ensure port 3000 (or your configured port) is not in use

### Database Connection Errors

```bash
# Test MySQL connection
mysql -h localhost -u root -p

# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'lan_nexus';"

# Verify DATABASE_URL format in .env
# Correct format: mysql://user:password@host:port/database
```

### Permission Errors

```bash
# Ensure proper file permissions
chmod +x index.js
chmod 600 .env  # Protect sensitive configuration
```

### Migration Issues

```bash
# Reset migrations (WARNING: destroys data)
mysql -u root -p -e "DROP DATABASE lan_nexus; CREATE DATABASE lan_nexus;"
npm run install

# Or run update script again
npm run update
```

## 📈 Performance Tips

1. **Use a reverse proxy** (nginx, Caddy) for production
2. **Enable gzip compression** in your reverse proxy
3. **Use PM2** for process management
4. **Configure database pooling** appropriately
5. **Monitor memory usage** and adjust as needed

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start index.js --name lan-nexus

# Auto-restart on system reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs lan-nexus

# Restart server
pm2 restart lan-nexus
```

## 🔄 Updating

When a new version is released:

1. **Backup everything** (database, .env, uploads)
2. Download the new release
3. Run `npm run update` to migrate database
4. Restart the server

See `UPDATE.md` for detailed instructions.

## 📝 Version Information

This release package version can be found in `package.json`:

```bash
cat package.json | grep version
```

## 🆘 Getting Help

- **Documentation**: Check `UPDATE.md` and `.env.example`
- **GitHub Issues**: https://github.com/your-repo/issues
- **Logs**: Check console output and error messages

## 📄 License

See the main repository for license information.

---

**Enjoy your LAN gaming! 🎮**