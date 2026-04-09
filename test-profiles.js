import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    console.log("Fetching profiles...");
    const { data, error } = await supabase.from('profiles').select('*, units(name)');
    if (error) {
        console.error("ERRO DETECTADO:", error);
    } else {
        console.log("Sucesso:", data);
    }

    console.log("Tentando fetch mais simples...");
    const { data: d2, error: e2 } = await supabase.from('profiles').select('*');
    if (e2) {
        console.error("ERRO SIMPLES:", e2);
    } else {
        console.log("Sucesso Simples. Count:", d2?.length);
    }
}

test();
