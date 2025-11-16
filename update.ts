#!/usr/bin/env tsx
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}→ ${msg}${colors.reset}`),
};

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): DatabaseConfig {
  // Parse mysql://user:password@host:port/database
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function checkEnvFileExists(): Promise<boolean> {
  return fs.existsSync(path.join(process.cwd(), '.env'));
}

async function checkDatabaseConnection(config: DatabaseConfig): Promise<boolean> {
  try {
    const connection = await createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function checkDrizzleFolderExists(): Promise<boolean> {
  const drizzlePath = path.join(process.cwd(), 'drizzle');
  return fs.existsSync(drizzlePath) && fs.statSync(drizzlePath).isDirectory();
}

async function getMigrationFiles(): Promise<string[]> {
  const drizzlePath = path.join(process.cwd(), 'drizzle');
  
  if (!fs.existsSync(drizzlePath)) {
    return [];
  }

  const files = fs.readdirSync(drizzlePath);
  return files.filter(file => file.endsWith('.sql')).sort();
}

async function getAppliedMigrations(config: DatabaseConfig): Promise<string[]> {
  try {
    const connection = await createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    // Check if __drizzle_migrations table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE '__drizzle_migrations'"
    );

    if (Array.isArray(tables) && tables.length === 0) {
      await connection.end();
      return [];
    }

    // Get applied migrations
    const [rows] = await connection.query(
      'SELECT hash FROM __drizzle_migrations ORDER BY created_at'
    ) as any[];

    await connection.end();
    
    return rows.map((row: any) => row.hash);
  } catch (error) {
    return [];
  }
}

async function runMigrations(): Promise<void> {
  try {
    log.info('Running database migrations...');
    const { stdout, stderr } = await execAsync('npx drizzle-kit migrate');
    
    if (stdout) {
      const lines = stdout.split('\n').filter(line => line.trim());
      lines.forEach(line => console.log(`  ${colors.magenta}${line}${colors.reset}`));
    }
    
    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecated')) {
      console.error(stderr);
    }

    log.success('Database migrations completed successfully');
  } catch (error: any) {
    throw new Error(`Migration failed: ${error.message}`);
  }
}

async function checkEnvironmentVariables(): Promise<boolean> {
  const requiredVars = ['DATABASE_URL'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    log.warning('Missing required environment variables:');
    missing.forEach((varName) => {
      console.log(`  - ${varName}`);
    });
    return false;
  }

  return true;
}

async function displayWelcome(): Promise<void> {
  console.log(`
${colors.magenta}${colors.bright}╔════════════════════════════════════════╗
║                                        ║
║      LAN Nexus Database Updater       ║
║                                        ║
╚════════════════════════════════════════╝${colors.reset}

This script will update your database schema to the latest version.
`);
}

async function createBackupRecommendation(): Promise<void> {
  console.log(`
${colors.yellow}${colors.bright}⚠️  IMPORTANT: Database Backup Recommendation${colors.reset}

Before running migrations, it's recommended to backup your database.

${colors.bright}Quick MySQL backup command:${colors.reset}
${colors.cyan}mysqldump -u [user] -p [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql${colors.reset}

${colors.bright}Or if using Docker:${colors.reset}
${colors.cyan}docker exec [container_name] mysqldump -u [user] -p[password] [database] > backup.sql${colors.reset}
`);
}

async function displayMigrationSummary(pendingMigrations: string[]): Promise<void> {
  if (pendingMigrations.length === 0) {
    log.success('Database is up to date! No migrations needed.');
    return;
  }

  console.log(`
${colors.bright}Pending Migrations:${colors.reset}
${pendingMigrations.map((m, i) => `  ${i + 1}. ${colors.cyan}${m}${colors.reset}`).join('\n')}

${colors.yellow}${pendingMigrations.length} migration(s) will be applied${colors.reset}
`);
}

async function main(): Promise<void> {
  try {
    await displayWelcome();

    // Step 1: Check if .env exists
    log.step('Step 1: Checking environment configuration');
    const envExists = await checkEnvFileExists();
    
    if (!envExists) {
      log.error('.env file not found');
      console.log('\nPlease ensure you have a .env file with your database configuration.');
      console.log('Required: DATABASE_URL=mysql://user:password@host:port/database');
      process.exit(1);
    }
    log.success('.env file found');

    // Step 2: Check environment variables
    log.step('Step 2: Validating environment variables');
    const varsValid = await checkEnvironmentVariables();
    
    if (!varsValid) {
      log.error('Cannot continue with missing environment variables');
      console.log('\nPlease update your .env file with DATABASE_URL');
      process.exit(1);
    }
    log.success('Environment variables validated');

    // Step 3: Parse database configuration
    log.step('Step 3: Parsing database configuration');
    const databaseUrl = process.env.DATABASE_URL!;
    const dbConfig = parseDatabaseUrl(databaseUrl);
    log.success(`Connected to database: ${dbConfig.database}`);

    // Step 4: Check database connection
    log.step('Step 4: Testing database connection');
    const isConnected = await checkDatabaseConnection(dbConfig);

    if (!isConnected) {
      log.error('Cannot connect to database');
      log.warning('Please ensure your MySQL server is running and credentials are correct');
      console.log(`\n${colors.bright}Connection details:${colors.reset}`);
      console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
      console.log(`  Database: ${dbConfig.database}`);
      console.log(`  User: ${dbConfig.user}`);
      process.exit(1);
    }
    log.success('Database connection successful');

    // Step 5: Check for drizzle folder
    log.step('Step 5: Checking migration files');
    const drizzleExists = await checkDrizzleFolderExists();
    
    if (!drizzleExists) {
      log.warning('No drizzle migration folder found');
      log.info('This may be a fresh installation. Migrations may need to be generated first.');
      process.exit(0);
    }

    const migrationFiles = await getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      log.warning('No migration files found in drizzle folder');
      log.info('Database schema is either up to date or migrations need to be generated');
      process.exit(0);
    }

    log.success(`Found ${migrationFiles.length} migration file(s)`);

    // Step 6: Check applied migrations
    log.step('Step 6: Checking migration status');
    const appliedMigrations = await getAppliedMigrations(dbConfig);
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file.replace('.sql', ''))
    );

    log.info(`Applied migrations: ${appliedMigrations.length}`);
    log.info(`Pending migrations: ${pendingMigrations.length}`);

    await displayMigrationSummary(pendingMigrations);

    if (pendingMigrations.length === 0) {
      console.log(`\n${colors.green}${colors.bright}Database is up to date!${colors.reset}\n`);
      process.exit(0);
    }

    // Step 7: Backup recommendation
    await createBackupRecommendation();

    // Step 8: Run migrations
    log.step('Step 7: Running migrations');
    await runMigrations();

    // Success!
    console.log(`
${colors.green}${colors.bright}╔════════════════════════════════════════╗
║                                        ║
║    Database update completed!          ║
║                                        ║
╚════════════════════════════════════════╝${colors.reset}

${colors.bright}Your database has been updated to the latest schema.${colors.reset}

${colors.bright}Next steps:${colors.reset}

  1. Restart your application if it's running
  2. Test your application to ensure everything works
  3. Check logs for any issues

${colors.yellow}If you encounter any issues, restore from your backup${colors.reset}
`);

  } catch (error: any) {
    log.error(`Update failed: ${error.message}`);
    console.error('\n', error);
    console.log(`
${colors.yellow}${colors.bright}Recovery steps:${colors.reset}

1. Check your database connection details in .env
2. Ensure MySQL server is running
3. Verify migration files exist in ./drizzle folder
4. If needed, restore from backup
5. Contact support if the issue persists
`);
    process.exit(1);
  }
}

// Run the updater
main();