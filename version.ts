#!/usr/bin/env tsx
import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as packageJson from './package.json';

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

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): DatabaseConfig {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
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

    const [tables] = await connection.query(
      "SHOW TABLES LIKE '__drizzle_migrations'"
    );

    if (Array.isArray(tables) && tables.length === 0) {
      await connection.end();
      return [];
    }

    const [rows] = await connection.query(
      'SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at'
    ) as any[];

    await connection.end();
    
    return rows.map((row: any) => row.hash);
  } catch (error) {
    return [];
  }
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

async function main(): Promise<void> {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════╗
║                                        ║
║      LAN Nexus Version Info            ║
║                                        ║
╚════════════════════════════════════════╝${colors.reset}
`);

  // Application Version
  console.log(`${colors.bright}Application Version:${colors.reset}`);
  console.log(`  ${colors.green}v${packageJson.version}${colors.reset}`);
  console.log();

  // Node.js Version
  console.log(`${colors.bright}Node.js Version:${colors.reset}`);
  console.log(`  ${colors.green}${process.version}${colors.reset}`);
  console.log();

  // Environment
  console.log(`${colors.bright}Environment:${colors.reset}`);
  console.log(`  ${process.env.NODE_ENV || 'development'}`);
  console.log();

  // Database Info
  if (!process.env.DATABASE_URL) {
    console.log(`${colors.yellow}⚠ DATABASE_URL not configured${colors.reset}`);
    console.log('  Set DATABASE_URL in .env to see database information');
    process.exit(0);
  }

  try {
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
    
    console.log(`${colors.bright}Database Configuration:${colors.reset}`);
    console.log(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}`);
    console.log(`  User: ${dbConfig.user}`);
    console.log();

    // Check connection
    const isConnected = await checkDatabaseConnection(dbConfig);
    
    console.log(`${colors.bright}Database Status:${colors.reset}`);
    if (isConnected) {
      console.log(`  ${colors.green}✓ Connected${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ Not Connected${colors.reset}`);
      console.log('\n  Cannot retrieve migration information without database connection.');
      process.exit(0);
    }
    console.log();

    // Migration Status
    const migrationFiles = await getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations(dbConfig);
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file.replace('.sql', ''))
    );

    console.log(`${colors.bright}Migration Status:${colors.reset}`);
    console.log(`  Total Migrations: ${migrationFiles.length}`);
    console.log(`  Applied: ${colors.green}${appliedMigrations.length}${colors.reset}`);
    console.log(`  Pending: ${pendingMigrations.length > 0 ? colors.yellow : colors.green}${pendingMigrations.length}${colors.reset}`);
    console.log();

    if (pendingMigrations.length > 0) {
      console.log(`${colors.yellow}${colors.bright}Pending Migrations:${colors.reset}`);
      pendingMigrations.forEach((migration, index) => {
        console.log(`  ${index + 1}. ${colors.cyan}${migration}${colors.reset}`);
      });
      console.log();
      console.log(`${colors.yellow}Run 'npm run update' to apply pending migrations${colors.reset}`);
    } else {
      console.log(`${colors.green}${colors.bright}✓ Database is up to date!${colors.reset}`);
    }

    console.log();

  } catch (error: any) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();