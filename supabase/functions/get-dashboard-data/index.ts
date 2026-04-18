import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body vazio é ok
    }

    const userId = body.userId;
    console.log("[DASH] Request received. userId:", userId);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[DASH] Missing SUPABASE env vars!");
      throw new Error("Missing environment variables");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verificar role do usuario no banco
    if (!userId) {
      console.error("[DASH] No userId provided!");
      throw new Error("userId is required");
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (profileErr) {
      console.error("[DASH] Profile lookup error:", JSON.stringify(profileErr));
      throw new Error("User profile not found: " + profileErr.message);
    }

    console.log("[DASH] User role:", profile.role);

    // Autorização: só admin, super_admin e diretor_executivo
    const allowedRoles = ['admin', 'super_admin', 'diretor_executivo'];
    if (!allowedRoles.includes(profile.role)) {
       console.error("[DASH] Unauthorized role:", profile.role);
       throw new Error(`Unauthorized role: ${profile.role}`);
    }

    // 2. Busca TODOS os dados necessários para o dashboard
    console.log("[DASH] Fetching all data...");
    const [honoreesRes, unitsRes, regionalsRes, profilesRes] = await Promise.all([
        supabaseAdmin.from('honorees').select('*'),
        supabaseAdmin.from('units').select('*').order('name'),
        supabaseAdmin.from('regionals').select('*').order('name'),
        supabaseAdmin.from('profiles').select('id, full_name, username, role, unit_id, regional_id'),
    ]);

    if (honoreesRes.error) {
      console.error("[DASH] Honorees error:", JSON.stringify(honoreesRes.error));
      throw honoreesRes.error;
    }
    if (unitsRes.error) {
      console.error("[DASH] Units error:", JSON.stringify(unitsRes.error));
      throw unitsRes.error;
    }
    if (regionalsRes.error) {
      console.error("[DASH] Regionals error:", JSON.stringify(regionalsRes.error));
      throw regionalsRes.error;
    }
    if (profilesRes.error) {
      console.error("[DASH] Profiles error:", JSON.stringify(profilesRes.error));
      throw profilesRes.error;
    }

    console.log(`[DASH] SUCCESS! ${honoreesRes.data.length} honorees, ${unitsRes.data.length} units, ${regionalsRes.data.length} regionals, ${profilesRes.data.length} profiles`);

    return new Response(JSON.stringify({ 
        honorees: honoreesRes.data,
        units: unitsRes.data,
        regionals: regionalsRes.data,
        profiles: profilesRes.data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[DASH] FATAL ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});