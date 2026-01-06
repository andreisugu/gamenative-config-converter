const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generate() {
  try {
    // Fetch distinct games
    const { data: games } = await supabase.from('games').select('id, name');
    
    // Fetch distinct devices with GPU info
    const { data: devices } = await supabase.from('devices').select('id, model, gpu');

    const filterData = {
      games: games || [],
      gpus: [...new Set((devices || []).map(d => d.gpu).filter(Boolean))],
      devices: [...new Set((devices || []).map(d => d.model).filter(Boolean))],
      updatedAt: new Date().toISOString()
    };

    // Save to the public folder so it's included in the build
    fs.writeFileSync('./public/filters.json', JSON.stringify(filterData));
    console.log('Filters JSON generated successfully!');
    console.log(`Generated ${filterData.games.length} games, ${filterData.gpus.length} GPUs, ${filterData.devices.length} devices`);
  } catch (error) {
    console.error('Error generating filters:', error);
    process.exit(1);
  }
}

generate();