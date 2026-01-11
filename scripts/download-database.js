#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import Supabase client - for Node.js environment
// This script can be run from GitHub Actions or locally
const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://egtttatimmnyxoivqcoi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHR0YXRpbW1ueXhvaXZxY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTQ4NjEsImV4cCI6MjA3MjU3MDg2MX0.JleNsgQr4LfSikOqnQKRnPlBCzg2zlEiPPbLSDG9xmE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadTable(tableName, batchSize = 1000) {
  console.log(`Downloading table: ${tableName}...`);
  let allData = [];
  let from = 0;
  let totalFetched = 0;

  try {
    while (true) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        throw error;
      }

      if (!data || data.length === 0) break;

      allData.push(...data);
      totalFetched += data.length;
      
      console.log(`  Fetched ${totalFetched} rows from ${tableName}...`);

      if (data.length < batchSize) break;
      from += batchSize;
    }

    console.log(`✓ Downloaded ${allData.length} rows from ${tableName}`);
    return allData;
  } catch (error) {
    console.error(`Failed to download ${tableName}:`, error);
    return [];
  }
}

async function downloadEntireDatabase() {
  try {
    console.log('Starting database download...\n');

    // Get list of all tables by attempting to fetch from known tables
    // For a complete database export, we need to know which tables exist
    // Note: 'gpus' table doesn't exist - GPU data is extracted from 'devices' table
    const tables = [
      'devices',
      'games',
      'game_runs',
      'filters',
      'users',
      'configurations',
      'config_entries'
    ];

    const database = {};
    let totalRows = 0;

    for (const table of tables) {
      const tableData = await downloadTable(table);
      if (tableData.length > 0) {
        database[table] = tableData;
        totalRows += tableData.length;
      }
    }

    console.log(`\nTotal rows downloaded: ${totalRows}`);

    // Write to cached-configs.json in the public directory
    const outputPath = path.join(__dirname, '../public/cached-configs.json');
    const output = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      tables: database
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✓ Database exported to: ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('Fatal error during database download:', error);
    process.exit(1);
  }
}

downloadEntireDatabase();
