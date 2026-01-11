#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function populateLookupTables() {
  try {
    console.log('Populating lookup tables in SQLite database...\n');

    // Load games.json - this has Steam game names but no IDs
    const gamesJsonPath = path.join(__dirname, '../public/games.json');
    const games = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
    
    // Load devices.json
    const devicesJsonPath = path.join(__dirname, '../public/devices.json');
    const devices = JSON.parse(fs.readFileSync(devicesJsonPath, 'utf8'));

    // Load the existing SQLite database
    const dbPath = path.join(__dirname, '../public/cached-configs.sqlite');
    const fileBuffer = fs.readFileSync(dbPath);
    
    // Initialize sql.js
    const SQL = await initSqlJs();
    const db = new SQL.Database(fileBuffer);

    // Get unique game_ids with their steam app IDs from the data table
    console.log('Extracting game mappings from data...');
    const gameResult = db.exec(`
      SELECT DISTINCT game_id, configs_app_id 
      FROM data 
      WHERE game_id IS NOT NULL AND configs_app_id IS NOT NULL
      ORDER BY game_id
    `);
    
    const gameIdToSteamId = new Map();
    if (gameResult.length > 0) {
      for (const row of gameResult[0].values) {
        const gameId = row[0];
        const steamAppId = row[1];
        if (!gameIdToSteamId.has(gameId)) {
          gameIdToSteamId.set(gameId, steamAppId);
        }
      }
    }
    console.log(`Found ${gameIdToSteamId.size} game ID to Steam ID mappings`);

    // Build a Steam ID to name lookup from games array
    // Note: games.json doesn't have IDs, so we'll try to use the Steam app list
    // Let's fetch it if possible
    console.log('Fetching Steam games list...');
    let steamGames = [];
    try {
      const response = await fetch('https://raw.githubusercontent.com/jsnli/steamappidlist/master/data/games_appid.json');
      if (response.ok) {
        steamGames = await response.json();
        console.log(`Loaded ${steamGames.length} Steam games`);
      }
    } catch (e) {
      console.log('Could not fetch Steam games list, will use placeholder names');
    }
    
    const steamIdToName = new Map();
    for (const game of steamGames) {
      steamIdToName.set(game.appid, game.name);
    }

    // Populate games table
    console.log('\nPopulating games table...');
    const insertGame = db.prepare('INSERT OR REPLACE INTO games (id, name, steam_app_id) VALUES (?, ?, ?)');
    let gamesInserted = 0;
    
    for (const [gameId, steamAppId] of gameIdToSteamId.entries()) {
      const gameName = steamIdToName.get(steamAppId) || `Game ${steamAppId}`;
      insertGame.run([gameId, gameName, steamAppId]);
      gamesInserted++;
    }
    insertGame.free();
    console.log(`✓ Inserted ${gamesInserted} games`);

    // For devices, we don't have a good mapping from device_id to model/gpu
    // But we can create placeholder entries for all unique device_ids
    console.log('\nExtracting device IDs from data...');
    const deviceResult = db.exec(`
      SELECT DISTINCT device_id
      FROM data 
      WHERE device_id IS NOT NULL
      ORDER BY device_id
    `);
    
    const deviceIds = new Set();
    if (deviceResult.length > 0) {
      for (const row of deviceResult[0].values) {
        deviceIds.add(row[0]);
      }
    }
    console.log(`Found ${deviceIds.size} unique device IDs`);

    // Insert placeholder device entries
    console.log('\nPopulating devices table...');
    const insertDevice = db.prepare('INSERT OR REPLACE INTO devices (id, name, model, gpu, android_ver) VALUES (?, ?, ?, ?, ?)');
    let devicesInserted = 0;
    
    for (const deviceId of deviceIds) {
      // Use placeholder values - actual device info would need to come from Supabase
      insertDevice.run([deviceId, `Device ${deviceId}`, `Model ${deviceId}`, 'Unknown', null]);
      devicesInserted++;
    }
    insertDevice.free();
    console.log(`✓ Inserted ${devicesInserted} devices`);

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

populateLookupTables();
