const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateGpus() {
  try {
    // GPUs from generated file or fallback to Supabase
    let gpus = [];
    try {
      const gpuFileResponse = await fetch('./public/gpus.json');
      if (gpuFileResponse.ok) {
        gpus = await gpuFileResponse.json();
        console.log('Using GPUs from public/gpus.json file');
      } else {
        throw new Error('public/gpus.json not found');
      }
    } catch {
      console.log('Falling back to Supabase for GPUs');
      const { data: devices } = await supabase.from('devices').select('gpu');
      gpus = [...new Set((devices || []).map(d => d.gpu).filter(Boolean))];
    }

    // Read existing filters
    let existingData = { games: [], gpus: [], devices: [], updatedAt: new Date().toISOString() };
    try {
      existingData = JSON.parse(fs.readFileSync('./public/filters.json', 'utf8'));
    } catch (e) {}

    // Update only GPUs
    const filterData = {
      ...existingData,
      gpus: gpus,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync('./public/filters.json', JSON.stringify(filterData));
    console.log(`Generated ${filterData.gpus.length} GPUs`);
  } catch (error) {
    console.error('Error generating GPUs:', error);
    process.exit(1);
  }
}

generateGpus();