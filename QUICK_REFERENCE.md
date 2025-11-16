# Drizzle Updater - Quick Reference Card

## 🚀 Common Commands

### For Users (Production)

```bash
# Check version and migration status
npm run version

# Apply database migrations (when updating)
npm run update

# First-time setup (interactive)
npm run install

# View database in browser
npm run studio
```

### For Developers

```bash
# After editing schema.ts
npm run generate        # Generate migration files
npm run migrate         # Apply migrations locally
npm run studio          # View database visually

# Check what changed
cat drizzle/XXXX_*.sql

# Check status
npm run version
```

---

## 📦 Update Workflow (Users)

```bash
# 1. BACKUP!
mysqldump -u root -p lan_nexus > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Stop server
pm2 stop lan-nexus

# 3. Extract new version
unzip server-build.zip -d lan-nexus-new && cd lan-nexus-new

# 4. Install deps
npm ci --omit=dev

# 5. Copy config
cp ../lan-nexus-old/.env .env

# 6. Update database
npm run update

# 7. Start server
pm2 start index.js --name lan-nexus
```

---

## 🔧 Development Workflow

```bash
# 1. Edit schema
vim src/server/db/schema.ts

# 2. Generate migration
npm run generate

# 3. Review SQL
cat drizzle/XXXX_*.sql

# 4. Apply locally
npm run migrate

# 5. Test
npm run dev

# 6. Commit
git add drizzle/ src/server/db/schema.ts
git commit -m "Add feature X"
git push

# 7. Release
git tag v1.2.3
git push --tags
```

---

## 🎯 Quick Checks

```bash
# Is database connected?
npm run version

# What migrations are pending?
npm run version | grep "Pending:"

# What's in the database?
npm run studio

# Manual check
mysql -u root -p -e "SELECT * FROM lan_nexus.__drizzle_migrations;"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check `DATABASE_URL` in `.env` |
| "No migrations found" | Ensure `drizzle/` folder exists |
| "Migration failed" | Check error, restore backup if needed |
| ".env file not found" | `cp .env.example .env` and edit |

---

## 📁 Important Files

```
drizzle/                    # Migration SQL files
├── meta/
│   ├── _journal.json      # Migration history
│   └── XXXX_snapshot.json # Schema snapshots
└── XXXX_migration.sql     # Actual migrations

drizzle.config.ts          # Drizzle configuration
update.ts                  # Update script
install.ts                 # Install script
version.ts                 # Version checker
src/server/db/schema.ts    # Database schema (edit this!)
```

---

## ⚠️ Critical Rules

### DO ✅
- Always backup before updating
- Commit migration files with code
- Test migrations locally first
- Run `npm run version` to check status

### DON'T ❌
- Never modify existing migrations
- Never delete migration files
- Never skip database backups
- Don't apply migrations manually

---

## 🔗 Full Documentation

- **UPDATE.md** - Complete update guide
- **MIGRATIONS.md** - Developer migration guide
- **DRIZZLE_UPDATER.md** - System architecture
- **RELEASE_README.md** - Release package guide

---

## 💾 Backup Commands

```bash
# MySQL backup
mysqldump -u root -p lan_nexus > backup.sql

# Docker MySQL backup
docker exec mysql_container mysqldump -u root -ppassword lan_nexus > backup.sql

# Restore backup
mysql -u root -p lan_nexus < backup.sql
```

---

## 🎓 Example: Adding a Table

```typescript
// 1. In src/server/db/schema.ts
export const notificationsTable = mysqlTable('notifications', {
  id: serial().primaryKey(),
  userId: int('user_id').notNull(),
  message: text('message').notNull(),
  isRead: int('is_read').default(0),
  createdAt: datetime('created_at').notNull(),
});
```

```bash
# 2. Generate and apply
npm run generate
npm run migrate

# 3. Test
npm run dev

# 4. Commit
git add drizzle/ src/server/db/schema.ts
git commit -m "Add notifications table"
```

---

**Keep this handy!** 📌