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
    const { targetUserId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!targetUserId || !sessionId) throw new Error("Faltam parâmetros.");

    // 1. Verificando o chamador
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Sessão inválida.");
    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'active') throw new Error("Sessão inativa.");
    
    const callerId = sessionData.user_id;

    // Impede o usuário de se deletar acidentalmente
    if (callerId === targetUserId) {
        throw new Error("Você não pode deletar a si mesmo.");
    }

    // 2. Garantindo permissão de Admin
    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const callerData = await callerRes.json();
    if (callerData.public_metadata?.role !== 'admin' && callerData.public_metadata?.role !== 'super_admin') {
       throw new Error("Não autorizado.");
    }

    // 3. Deleta o usuário do Clerk
    const deleteRes = await fetch(`https://api.clerk.com/v1/users/${targetUserId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!deleteRes.ok) {
        const errData = await deleteRes.json();
        console.error(errData);
    }

    // 4. Deleta também a linha do Supabase (tabela profiles)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(targetUserId)}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
        });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[delete-clerk-user]", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});