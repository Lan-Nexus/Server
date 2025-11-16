# Drizzle Updater System - Developer Documentation

This document explains the Drizzle updater system that has been integrated into the LAN Nexus Server build and release process.

## 📋 Overview

The Drizzle updater system provides automatic database schema migration when deploying new versions of the LAN Nexus Server. It ensures that users can seamlessly update their installations without manual database intervention.

## 🎯 Features

- ✅ **Automated Migration Detection**: Detects pending database migrations
- ✅ **Safe Migration Application**: Applies migrations in correct order
- ✅ **Connection Validation**: Verifies database connectivity before migrating
- ✅ **User-Friendly Output**: Clear, colored terminal output
- ✅ **Error Handling**: Comprehensive error messages and recovery suggestions
- ✅ **Backup Recommendations**: Reminds users to backup before migrating
- ✅ **Version Tracking**: Shows current version and migration status

## 📦 What's Included in the Release

When GitHub Actions builds a release, the following files are automatically included:

### Core Files
- `drizzle/` - All migration SQL files and metadata
- `drizzle.config.ts` - Drizzle ORM configuration
- `update.ts` - Database updater script
- `install.ts` - First-time installation script
- `version.ts` - Version and migration status checker

### Documentation
- `UPDATE.md` - Comprehensive update guide for users
- `README.md` - Quick start guide for the release package
- `.env.example` - Environment variable template

### Build Artifacts
- Compiled server code
- `package.json` and `package-lock.json`
- `Dockerfile` for containerized deployments

## 🔧 Scripts

### `npm run update`

Runs the database updater script (`update.ts`).

**What it does:**
1. Checks for `.env` file
2. Validates required environment variables
3. Parses database configuration from `DATABASE_URL`
4. Tests database connection
5. Detects pending migrations
6. Shows backup recommendations
7. Applies migrations using Drizzle Kit
8. Confirms successful completion

**Usage:**
```bash
npm run update
```

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

### `npm run install`

Runs the first-time installation script (`install.ts`).

**What it does:**
1. Interactive environment configuration (if no `.env` exists)
2. Database connection testing
3. Database creation (if needed)
4. Generates initial migrations
5. Applies all migrations
6. Sets up the server for first use

**Usage:**
```bash
npm run install
```

### `npm run version`

Shows current version and migration status (`version.ts`).

**What it does:**
1. Displays application version
2. Shows Node.js version
3. Shows database configuration
4. Tests database connection
5. Lists migration status (applied vs pending)
6. Shows which migrations are pending

**Usage:**
```bash
npm run version
```

**Example output:**
```
╔════════════════════════════════════════╗
║                                        ║
║      LAN Nexus Version Info            ║
║                                        ║
╚════════════════════════════════════════╝

Application Version:
  v1.2.3

Node.js Version:
  v22.0.0

Environment:
  production

Database Configuration:
  Host: localhost:3306
  Database: lan_nexus
  User: root

Database Status:
  ✓ Connected

Migration Status:
  Total Migrations: 5
  Applied: 3
  Pending: 2

Pending Migrations:
  1. 0004_add_new_feature.sql
  2. 0005_update_schema.sql

Run 'npm run update' to apply pending migrations
```

## 🔄 GitHub Actions Integration

The updater is automatically integrated into the GitHub Actions workflow:

### Release Build Process

```yaml
- name: Copy Drizzle migrations and updater to build directory
  run: |
    cp -r drizzle dist/drizzle
    cp drizzle.config.ts dist/drizzle.config.ts
    cp update.ts dist/update.ts
    cp install.ts dist/install.ts
    cp version.ts dist/version.ts
    cp UPDATE.md dist/UPDATE.md
    cp RELEASE_README.md dist/README.md
```

### When Triggered

- **On version tag push** (e.g., `v1.0.0`): Creates a release with zip file
- **On pull request**: Creates artifact for testing

### What's in the Zip

The `server-build.zip` file contains everything needed for a complete deployment:
- Production-ready compiled code
- All database migration files
- Migration tools and scripts
- Documentation
- Configuration templates

## 📖 User Workflow

### First-Time Installation

```bash
# 1. Extract the release
unzip server-build.zip -d lan-nexus

# 2. Install dependencies
cd lan-nexus
npm ci --omit=dev

# 3. Configure environment
cp .env .env
# Edit .env with database credentials

# 4. Run installer
npm run install

# 5. Start server
node index.js
```

### Updating Existing Installation

```bash
# 1. Backup database (CRITICAL!)
mysqldump -u root -p lan_nexus > backup.sql

# 2. Extract new version
unzip server-build.zip -d lan-nexus-new

# 3. Install dependencies
cd lan-nexus-new
npm ci --omit=dev

# 4. Copy existing .env
cp ../lan-nexus-old/.env .env

# 5. Run updater
npm run update

# 6. Start server
node index.js
```

## 🛠️ Development Guide

### Adding New Migrations

When you change the database schema:

```bash
# 1. Update schema in src/server/db/schema.ts

# 2. Generate migration
npm run generate

# This creates a new SQL file in drizzle/ folder

# 3. Test migration locally
npm run migrate

# 4. Commit the migration file
git add drizzle/
git commit -m "Add migration for new feature"
```

### Testing the Updater

Before releasing:

```bash
# 1. Build the project
npm run build

# 2. Test the updater script
cd dist
npm run update

# 3. Verify migrations applied
npm run version
```

### Migration File Structure

```
drizzle/
├── meta/
│   ├── _journal.json          # Migration history
│   └── 0000_snapshot.json     # Schema snapshots
└── 0000_clean_bruce_banner.sql  # Actual migration SQL
```

## 🔍 How It Works

### Migration Detection

The updater compares files in `drizzle/` with the `__drizzle_migrations` table:

```typescript
async function getAppliedMigrations(config: DatabaseConfig): Promise<string[]> {
  // Queries __drizzle_migrations table
  // Returns list of applied migration hashes
}

async function getMigrationFiles(): Promise<string[]> {
  // Reads drizzle/ directory
  // Returns list of .sql files
}

// Pending = Files - Applied
const pendingMigrations = migrationFiles.filter(
  file => !appliedMigrations.includes(file.replace('.sql', ''))
);
```

### Migration Application

Uses Drizzle Kit's migrate command:

```typescript
await execAsync('npx drizzle-kit migrate');
```

This:
1. Reads migration files in order
2. Executes SQL statements
3. Records migration in `__drizzle_migrations`
4. Handles transactions and rollback

### Error Handling

The updater provides detailed error messages:

```typescript
if (!envExists) {
  log.error('.env file not found');
  console.log('Please ensure you have a .env file...');
  process.exit(1);
}

if (!isConnected) {
  log.error('Cannot connect to database');
  console.log('Connection details:', dbConfig);
  process.exit(1);
}
```

## 🔒 Safety Features

### 1. Pre-Migration Checks
- Environment validation
- Database connectivity test
- Migration file existence check

### 2. Backup Reminders
- Displays backup commands before migration
- Warns about data loss risks
- Shows both MySQL and Docker backup methods

### 3. Clear Feedback
- Step-by-step progress indicators
- Color-coded success/error messages
- Detailed error information

### 4. Migration Tracking
- Uses `__drizzle_migrations` table
- Prevents duplicate migrations
- Maintains migration order

## 📝 Best Practices

### For Developers

1. **Test migrations locally** before committing
2. **Write reversible migrations** when possible
3. **Document breaking changes** in release notes
4. **Version migrations sequentially** (Drizzle does this automatically)
5. **Never modify existing migrations** - create new ones instead

### For Users

1. **Always backup before updating**
2. **Read UPDATE.md** before applying updates
3. **Test in staging** if possible
4. **Monitor logs** during and after update
5. **Keep old version** until new one is verified

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL in .env
- Verify MySQL is running
- Test credentials manually

**"Migration failed"**
- Check error message for SQL syntax errors
- Verify database user has ALTER/CREATE permissions
- Check for table conflicts

**"No migrations found"**
- Ensure drizzle/ folder exists
- Verify .sql files are present
- Check file permissions

### Recovery

If update fails:

```bash
# 1. Restore database backup
mysql -u root -p lan_nexus < backup.sql

# 2. Check version
npm run version

# 3. Try update again or contact support
npm run update
```

## 📊 Monitoring

### Check Migration Status

```bash
# Quick check
npm run version

# Detailed check
mysql -u root -p -e "SELECT * FROM lan_nexus.__drizzle_migrations;"
```

### Verify Database Schema

```bash
# Use Drizzle Studio
npm run studio

# Opens browser at http://localhost:4983
```

## 🚀 Future Enhancements

Potential improvements:

- [ ] Pre-migration backup automation
- [ ] Migration dry-run mode
- [ ] Rollback functionality
- [ ] Migration history export
- [ ] Email notifications on migration completion
- [ ] Health check endpoint for migration status
- [ ] Automated testing of migrations

## 📄 Related Files

- `update.ts` - Main updater script
- `install.ts` - Installation script
- `version.ts` - Version checker
- `drizzle.config.ts` - Drizzle configuration
- `UPDATE.md` - User documentation
- `RELEASE_README.md` - Release package guide
- `.github/workflows/release.yml` - CI/CD configuration

## 🤝 Contributing

When contributing migrations:

1. Follow the existing schema patterns
2. Test migrations both up and down (if applicable)
3. Update documentation if adding new tables/features
4. Include migration in PR description
5. Test update script with your changes

## 📞 Support

If issues arise:

1. Check UPDATE.md troubleshooting section
2. Review error messages carefully
3. Check GitHub Issues for similar problems
4. Create new issue with:
   - Error messages
   - Version information
   - Database details
   - Steps to reproduce

---

**Last Updated:** 2024
**Maintainer:** LAN Nexus Team
**Version:** 1.0.0