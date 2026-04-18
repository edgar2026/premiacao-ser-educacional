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
    const jsonBody = await req.json();
    const { id, email, firstName, lastName, role, unitId, forceRole, action, sessionId } = jsonBody;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
    
    // --- LÓGICA DE EXCLUSÃO REAL (CLERK + BANCO) ---
    if (action === 'delete') {
      if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY for deletion");
      
      // 1. Busca o ID do usuário no Clerk pelo email
      const targetRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
      });
      const targetData = await targetRes.json();
      const targetUser = targetData[0];

      if (targetUser) {
        // 2. Deleta do Clerk permanentemente
        const delRes = await fetch(`https://api.clerk.com/v1/users/${targetUser.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
        });
        if (!delRes.ok) throw new Error("Falha ao excluir usuário do Clerk");
      }

      // 3. Deleta do Supabase (ignora RLS via Service Role)
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      });

      return new Response(JSON.stringify({ success: true, message: "Excluído totalmente" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // --- LÓGICA DE SINCRONIZAÇÃO / ATUALIZAÇÃO ---
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
          role: (role && (role !== 'public' || forceRole)) ? role : (existing[0].role || 'public'),
          unit_id: (unitId || forceRole) ? unitId : existing[0].unit_id,
          ativo: !forceRole,
          updated_at: new Date().toISOString()
        })
      });
      resultData = await patchRes.json();
    } else {
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