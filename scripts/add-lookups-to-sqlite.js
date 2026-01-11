#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Database } = require('sql.js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadTable(tableName, batchSize = 1000) {
  console.log(`Downloading table: ${tableName}...`);
  let allData = [];
  let from = 0;

  try {
    while (true) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        throw error;
      }

      if (!data || data.length === 0) break;

      allData.push(...data);
      console.log(`  Fetched ${allData.length} rows from ${tableName}...`);

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

async function addLookupsToSQLite() {
  try {
    console.log('Starting to add lookup tables to SQLite database...\n');

    // Load the existing SQLite database
    const dbPath = path.join(__dirname, '../public/cached-configs.sqlite');
    const fileBuffer = fs.readFileSync(dbPath);
    
    // Initialize sql.js
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const db = new SQL.Database(fileBuffer);

    // Download games and devices from Supabase
    const games = await downloadTable('games');
    const devices = await downloadTable('devices');

    // Create games table
    console.log('\nCreating games lookup table...');
    db.run('DROP TABLE IF EXISTS games');
    db.run(`
      CREATE TABLE games (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        steam_app_id INTEGER
      )
    `);

    // Insert games data
    const insertGame = db.prepare('INSERT INTO games (id, name, steam_app_id) VALUES (?, ?, ?)');
    for (const game of games) {
      insertGame.run([game.id, game.name, game.steam_app_id || null]);
    }
    insertGame.free();
    console.log(`✓ Inserted ${games.length} games`);

    // Create devices table
    console.log('\nCreating devices lookup table...');
    db.run('DROP TABLE IF EXISTS devices');
    db.run(`
      CREATE TABLE devices (
        id INTEGER PRIMARY KEY,
        name TEXT,
        model TEXT NOT NULL,
        gpu TEXT,
        android_ver TEXT
      )
    `);

    // Insert devices data
    const insertDevice = db.prepare('INSERT INTO devices (id, name, model, gpu, android_ver) VALUES (?, ?, ?, ?, ?)');
    for (const device of devices) {
      insertDevice.run([device.id, device.name || null, device.model, device.gpu || null, device.android_ver || null]);
    }
    insertDevice.free();
    console.log(`✓ Inserted ${devices.length} devices`);

    // Save the updated database
    const updatedData = db.export();
    fs.writeFileSync(dbPath, updatedData);
    console.log(`\n✓ Updated SQLite database saved to: ${dbPath}`);
    console.log(`File size: ${(fs.statSync(dbPath).size / 1024 / 1024).toFixed(2)} MB`);

    db.close();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

addLookupsToSQLite();
