import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { id, email, firstName, lastName, role, unitId } = await req.json();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

    // Verifica se já existe um perfil com esse email
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });
    const existing = await checkRes.json();

    let resultData;
    
    if (existing && existing.length > 0) {
      // Se existe, atualiza forçando o ID correto do Clerk
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: id,
          full_name: fullName,
          role: role || existing[0].role || 'public',
          unit_id: unitId || existing[0].unit_id,
          updated_at: new Date().toISOString()
        })
      });
      resultData = await patchRes.json();
    } else {
      // Se não existe, cria um novo
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: id,
          username: email,
          full_name: fullName,
          role: role || 'public',
          primeiro_acesso: true,
          unit_id: unitId || null,
          ativo: true,
          updated_at: new Date().toISOString()
        })
      });
      resultData = await insertRes.json();
    }

    return new Response(JSON.stringify({ success: true, profile: resultData[0] }), {
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