import { createClient } from '@supabase/supabase-js';

// Public community database credentials - intentionally not using environment variables
// as this is a read-only public database provided for community use
const supabaseUrl = 'https://egtttatimmnyxoivqcoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHR0YXRpbW1ueXhvaXZxY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTQ4NjEsImV4cCI6MjA3MjU3MDg2MX0.JleNsgQr4LfSikOqnQKRnPlBCzg2zlEiPPbLSDG9xmE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
