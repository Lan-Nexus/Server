# LAN Nexus Server - Update Guide

This guide explains how to update your LAN Nexus Server installation to a new version, including database schema migrations.

## 📋 Table of Contents

- [Quick Update Guide](#quick-update-guide)
- [Detailed Update Process](#detailed-update-process)
- [Backup Recommendations](#backup-recommendations)
- [Troubleshooting](#troubleshooting)
- [Rollback Instructions](#rollback-instructions)

---

## 🚀 Quick Update Guide

For experienced users who want to update quickly:

```bash
# 1. Backup your database (IMPORTANT!)
mysqldump -u [user] -p [database] > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Stop your server
# (Use your process manager to stop the server)

# 3. Extract the new release
unzip server-build.zip -d lan-nexus-update

# 4. Navigate to the update directory
cd lan-nexus-update

# 5. Install production dependencies
npm ci --omit=dev

# 6. Copy your .env file from the old installation
cp /path/to/old/.env .env

# 7. Run the database updater
npm run update

# 8. Start your server
node index.js
```

---

## 📚 Detailed Update Process

### Step 1: Download the Latest Release

1. Go to the [Releases](https://github.com/your-repo/releases) page
2. Download the latest `server-build.zip` file
3. Extract it to a temporary directory

### Step 2: Backup Your Current Installation

#### Backup Database

**Using mysqldump:**
```bash
mysqldump -u root -p lan_nexus > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Using Docker:**
```bash
docker exec [container_name] mysqldump -u root -p[password] lan_nexus > backup.sql
```

#### Backup Configuration Files

```bash
# Backup your .env file
cp /path/to/current/installation/.env ~/lan-nexus-env-backup.txt

# Backup uploaded files (if any)
cp -r /path/to/current/installation/public/uploads ~/lan-nexus-uploads-backup
```

### Step 3: Stop the Current Server

Depending on how you run the server:

**If using systemd:**
```bash
sudo systemctl stop lan-nexus
```

**If using PM2:**
```bash
pm2 stop lan-nexus
```

**If running manually:**
```bash
# Press Ctrl+C in the terminal running the server
```

### Step 4: Install the Update

```bash
# Navigate to the extracted update directory
cd /path/to/server-build

# Install production dependencies
npm ci --omit=dev
```

### Step 5: Configure Environment

Copy your existing `.env` file or create a new one:

```bash
# Option 1: Copy from old installation
cp /path/to/old/installation/.env .env

# Option 2: Use the template
cp .env .env
# Then edit .env with your settings
```

**Required environment variables:**
- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Your JWT secret key
- `STEAM_API_KEY` - Your Steam API key
- `STEAM_GRID_ID_KEY` - Your SteamGridDB API key

### Step 6: Run Database Migrations

The update package includes an automated database updater:

```bash
npm run update
```

**What the updater does:**
1. ✅ Checks your environment configuration
2. ✅ Validates database connection
3. ✅ Shows pending migrations
4. ✅ Applies database schema changes
5. ✅ Confirms successful update

**Example output:**
```
╔════════════════════════════════════════╗
║                                        ║
║      LAN Nexus Database Updater       ║
║                                        ║
╚════════════════════════════════════════╝

→ Step 1: Checking environment configuration
✓ .env file found

→ Step 2: Validating environment variables
✓ Environment variables validated

→ Step 3: Parsing database configuration
✓ Connected to database: lan_nexus

→ Step 4: Testing database connection
✓ Database connection successful

→ Step 5: Checking migration files
✓ Found 3 migration file(s)

→ Step 6: Checking migration status
ℹ Applied migrations: 1
ℹ Pending migrations: 2

Pending Migrations:
  1. 0001_add_settings_table.sql
  2. 0002_add_game_events_status.sql

⚠ 2 migration(s) will be applied

→ Step 7: Running migrations
✓ Database migrations completed successfully

╔════════════════════════════════════════╗
║                                        ║
║    Database update completed!          ║
║                                        ║
╚════════════════════════════════════════╝
```

### Step 7: Start the Updated Server

**Using systemd:**
```bash
sudo systemctl start lan-nexus
```

**Using PM2:**
```bash
pm2 start lan-nexus
pm2 save
```

**Manual start:**
```bash
node index.js
```

### Step 8: Verify the Update

1. Check the server logs for any errors
2. Access the web interface
3. Verify all features are working correctly
4. Check that your data is intact

---

## 💾 Backup Recommendations

### Before Every Update

Always create backups before updating:

1. **Database Backup** - Essential for data recovery
2. **Configuration Backup** - Save your `.env` file
3. **Uploaded Files** - Backup any user-uploaded content

### Automated Backup Script

Create a backup script for easy backups:

```bash
#!/bin/bash
# save as backup.sh

BACKUP_DIR=~/lan-nexus-backups
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u root -p lan_nexus > $BACKUP_DIR/db_backup_$DATE.sql

# Backup .env
cp .env $BACKUP_DIR/env_backup_$DATE.txt

# Backup uploads (if exists)
if [ -d "public/uploads" ]; then
  tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz public/uploads
fi

echo "Backup completed: $BACKUP_DIR"
```

---

## 🔧 Troubleshooting

### Update Script Fails to Run

**Error: `.env file not found`**
```bash
# Solution: Create or copy your .env file
cp .env.example .env
# Edit .env with your configuration
```

**Error: `Cannot connect to database`**
```bash
# Solution: Check your DATABASE_URL in .env
# Verify MySQL is running:
sudo systemctl status mysql
# or for Docker:
docker ps | grep mysql
```

**Error: `Missing required environment variables`**
```bash
# Solution: Check your .env file has all required variables:
# - DATABASE_URL
# - JWT_SECRET
# - STEAM_API_KEY
# - STEAM_GRID_ID_KEY
```

### Migration Errors

**Error: `Migration failed`**

1. Check the error message for details
2. Verify database user has proper permissions
3. Ensure database is not corrupted
4. Try restoring from backup and re-running

**Error: `Table already exists`**

This usually means migrations are out of sync. You may need to:
1. Check the `__drizzle_migrations` table
2. Manually fix the migration state
3. Contact support if unsure

### Server Won't Start After Update

1. Check the logs for error messages
2. Verify all dependencies installed: `npm ci --omit=dev`
3. Ensure `.env` file is properly configured
4. Check database connection
5. If all else fails, rollback to previous version

---

## ⏪ Rollback Instructions

If the update causes issues, you can rollback:

### Step 1: Stop the New Version

```bash
# Stop the server using your method (systemd, PM2, etc.)
```

### Step 2: Restore Database Backup

```bash
# Drop the current database (CAREFUL!)
mysql -u root -p -e "DROP DATABASE lan_nexus; CREATE DATABASE lan_nexus;"

# Restore from backup
mysql -u root -p lan_nexus < backup_20240115_120000.sql
```

### Step 3: Restore Old Installation

```bash
# Go back to your old installation directory
cd /path/to/old/installation

# Start the server
node index.js
```

### Step 4: Verify Rollback

1. Check that the server starts successfully
2. Verify your data is intact
3. Test critical functionality

---

## 🆘 Getting Help

If you encounter issues during the update:

1. **Check the logs** - Look for error messages
2. **Review this guide** - Ensure you followed all steps
3. **Check GitHub Issues** - Someone may have had the same problem
4. **Create an Issue** - Provide:
   - Version you're updating from
   - Version you're updating to
   - Error messages
   - Steps you've taken
   - Database type and version
   - Operating system

---

## 📝 Update Checklist

Use this checklist to ensure a smooth update:

- [ ] Downloaded latest release
- [ ] Created database backup
- [ ] Backed up `.env` file
- [ ] Backed up uploaded files
- [ ] Stopped current server
- [ ] Extracted new version
- [ ] Installed dependencies (`npm ci --omit=dev`)
- [ ] Configured `.env` file
- [ ] Ran database updater (`npm run update`)
- [ ] Started server
- [ ] Verified functionality
- [ ] Tested critical features
- [ ] Monitored logs for errors

---

## 🎯 Best Practices

1. **Always backup before updating** - Can't stress this enough
2. **Test in a staging environment first** - If you have one
3. **Update during low-traffic periods** - Minimize user impact
4. **Keep old version until verified** - Don't delete until confirmed working
5. **Document your configuration** - Makes rollback easier
6. **Monitor after update** - Watch for unexpected issues
7. **Update regularly** - Don't fall too far behind

---

## 📊 Version Information

To check your current version:

```bash
# Check package.json
cat package.json | grep version

# Or check the server info endpoint
curl http://localhost:3000/api/info
```

---

## 🔄 Automated Updates (Advanced)

For advanced users, you can create an automated update script:

```bash
#!/bin/bash
# auto-update.sh

VERSION=$1
INSTALL_DIR="/opt/lan-nexus"
BACKUP_DIR="/opt/lan-nexus-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup
echo "Creating backup..."
mysqldump -u root -p lan_nexus > $BACKUP_DIR/db_$DATE.sql
cp $INSTALL_DIR/.env $BACKUP_DIR/env_$DATE.txt

# Download new version
echo "Downloading version $VERSION..."
wget https://github.com/your-repo/releases/download/v$VERSION/server-build.zip

# Stop server
echo "Stopping server..."
pm2 stop lan-nexus

# Extract and install
echo "Installing update..."
unzip -o server-build.zip -d $INSTALL_DIR-temp
cd $INSTALL_DIR-temp
npm ci --omit=dev
cp $INSTALL_DIR/.env .env

# Update database
echo "Updating database..."
npm run update

# Switch to new version
echo "Switching to new version..."
rm -rf $INSTALL_DIR-old
mv $INSTALL_DIR $INSTALL_DIR-old
mv $INSTALL_DIR-temp $INSTALL_DIR

# Start server
echo "Starting server..."
cd $INSTALL_DIR
pm2 start index.js --name lan-nexus

echo "Update complete!"
```

---

**Good luck with your update! 🚀**