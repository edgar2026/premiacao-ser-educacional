import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
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
    const { targetUserId, firstName, lastName, role, unitId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!targetUserId || !sessionId) throw new Error("Faltam parâmetros obrigatórios.");

    // 1. Verifica quem está chamando a função (segurança)
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Sessão inválida.");
    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'active') throw new Error("Sessão inativa.");
    
    const callerId = sessionData.user_id;

    // 2. Garante que quem está chamando é um Admin
    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const callerData = await callerRes.json();
    if (callerData.public_metadata?.role !== 'admin' && callerData.public_metadata?.role !== 'super_admin') {
       throw new Error("Não autorizado. Apenas administradores podem realizar esta ação.");
    }

    // 3. Atualiza os dados no Clerk
    const updateRes = await fetch(`https://api.clerk.com/v1/users/${targetUserId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        public_metadata: { 
          role,
          unit_id: unitId || null
        }
      }),
    });

    if (!updateRes.ok) {
        const errData = await updateRes.json();
        console.error(errData);
        throw new Error("Falha ao atualizar usuário no Clerk.");
    }

    // 4. Atualiza também no Supabase (perfis) para refletir na interface imediatamente
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(targetUserId)}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                full_name: fullName,
                role: role,
                unit_id: unitId || null
            })
        });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[update-clerk-user]", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});