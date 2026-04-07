import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://mdzcrzrsavqfqfjnkgeg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kemNyenJzYXZxZnFmam5rZ2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTQ2ODMsImV4cCI6MjA4NDE5MDY4M30.HR3EF9preHb_YUJummTWjXoEM_fu8wFV9BAIIL8eeYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
        .from('honorees')
        .select('*, awards!honorees_award_id_fkey(name), regionals(name), profiles:created_by(username)');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  if (error) console.log(error);
}
test();
