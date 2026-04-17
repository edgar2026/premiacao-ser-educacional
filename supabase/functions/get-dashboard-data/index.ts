import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_SECRET_KEY) {
      throw new Error("Missing environment variables");
    }

    // Verifica quem está chamando a função
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Invalid Session ID");
    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'active') throw new Error("Session is not active");
    
    const callerId = sessionData.user_id;

    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const callerData = await callerRes.json();
    const role = callerData.public_metadata?.role;

    // Se não for gestor macro, bloqueia!
    if (role !== 'admin' && role !== 'super_admin' && role !== 'diretor_executivo') {
       throw new Error("Unauthorized access to global dashboard");
    }

    // Busca todos os dados sensíveis usando a chave de Serviço para burlar RLS de forma segura
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: honorees, error } = await supabaseAdmin.from('honorees').select('*');

    if (error) throw error;

    return new Response(JSON.stringify({ honorees }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});