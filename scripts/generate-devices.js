const fs = require('fs');

async function generateDevices() {
  try {
    // Fetch Google Play supported devices CSV
    const csvResponse = await fetch('http://storage.googleapis.com/play_public/supported_devices.csv');
    const csvText = await csvResponse.text();
    
    // Parse CSV and create device entries
    const csvLines = csvText.split('\n').slice(1); // Skip header
    const playDevices = csvLines
      .filter(line => line.trim())
      .map(line => {
        // Clean and split CSV line properly
        const cleanLine = line.replace(/\0/g, '').replace(/"/g, '');
        const parts = cleanLine.split(',');
        if (parts.length < 4) return null;
        
        const retailBranding = parts[0]?.trim() || '';
        const marketingName = parts[1]?.trim() || '';
        const device = parts[2]?.trim() || '';
        const model = parts[3]?.trim() || '';
        
        if (!retailBranding || !model) return null;
        
        return {
          name: `${retailBranding} ${marketingName}`.trim(),
          model: `${retailBranding} ${model}`.trim()
        };
      })
      .filter(d => d && d.name && d.model && d.name.length > 3);

    // Read existing filters
    let existingData = { games: [], gpus: [], devices: [], updatedAt: new Date().toISOString() };
    try {
      existingData = JSON.parse(fs.readFileSync('./public/filters.json', 'utf8'));
    } catch (e) {}

    // Update only devices
    const filterData = {
      ...existingData,
      devices: playDevices,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync('./public/filters.json', JSON.stringify(filterData));
    console.log(`Generated ${filterData.devices.length} devices`);
  } catch (error) {
    console.error('Error generating devices:', error);
    process.exit(1);
  }
}

generateDevices();