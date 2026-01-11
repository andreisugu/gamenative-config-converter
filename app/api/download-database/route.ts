import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://egtttatimmnyxoivqcoi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHR0YXRpbW1ueXhvaXZxY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTQ4NjEsImV4cCI6MjA3MjU3MDg2MX0.JleNsgQr4LfSikOqnQKRnPlBCzg2zlEiPPbLSDG9xmE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadTable(tableName: string, batchSize = 1000) {
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

      if (data.length < batchSize) break;
      from += batchSize;
    }

    return allData;
  } catch (error) {
    console.error(`Failed to download ${tableName}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // List of tables to download
    const tables = [
      'devices',
      'games',
      'game_runs',
      'gpus',
      'filters',
      'users',
      'configurations',
      'config_entries'
    ];

    const database: Record<string, any[]> = {};
    let totalRows = 0;

    for (const table of tables) {
      const tableData = await downloadTable(table);
      if (tableData.length > 0) {
        database[table] = tableData;
        totalRows += tableData.length;
      }
    }

    const output = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      totalRows,
      tables: database
    };

    return Response.json(output);
  } catch (error) {
    console.error('Error downloading database:', error);
    return Response.json(
      { error: 'Failed to download database', details: String(error) },
      { status: 500 }
    );
  }
}
