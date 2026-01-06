const fs = require('fs');

async function generateGames() {
  try {
    // Fetch Steam games from API
    const steamResponse = await fetch('http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json');
    
    if (!steamResponse.ok) {
      throw new Error(`Steam API returned ${steamResponse.status}`);
    }
    
    const steamData = await steamResponse.json();
    
    // Filter and clean Steam games
    const steamGames = steamData.applist.apps
      .filter(app => {
        const name = app.name.toLowerCase();
        // Filter out DLC, soundtracks, demos, trailers, etc.
        return !name.includes('dlc') && 
               !name.includes('soundtrack') && 
               !name.includes('demo') && 
               !name.includes('trailer') && 
               !name.includes('beta') && 
               !name.includes('test') && 
               name.length > 2;
      })
      .map(app => ({ id: app.appid, name: app.name }))
      .slice(0, 50000); // Limit for performance

    // Read existing filters
    let existingData = { games: [], gpus: [], devices: [], updatedAt: new Date().toISOString() };
    try {
      existingData = JSON.parse(fs.readFileSync('./public/filters.json', 'utf8'));
    } catch (e) {}

    // Update only games
    const filterData = {
      ...existingData,
      games: steamGames,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync('./public/filters.json', JSON.stringify(filterData));
    console.log(`Generated ${filterData.games.length} Steam games`);
  } catch (error) {
    console.error('Error generating games:', error);
    process.exit(1);
  }
}

generateGames();