import { supabase } from '@/lib/supabase';
import ConfigBrowserClient from './ConfigBrowserClient';

interface GameConfig {
  id: number;
  rating: number;
  avg_fps: number;
  notes: string | null;
  configs: any;
  created_at: string;
  game: {
    name: string;
  } | null;
  device: {
    model: string;
    gpu: string;
    android_ver: string;
  } | null;
}

async function getConfigs(): Promise<GameConfig[]> {
  try {
    const { data, error } = await supabase
      .from('game_runs')
      .select('id,rating,avg_fps,notes,configs,created_at,game:games!inner(name),device:devices(model,gpu,android_ver)')
      .order('rating', { ascending: false })
      .order('avg_fps', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching configs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching configs:', error);
    return [];
  }
}

export default async function ConfigSearchPage() {
  const configs = await getConfigs();

  return <ConfigBrowserClient configs={configs} />;
}
