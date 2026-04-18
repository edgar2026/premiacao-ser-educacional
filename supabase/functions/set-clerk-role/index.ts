import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { email, role, unitId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!email || !role || !sessionId) throw new Error("Missing parameters");

    // 1. Verify caller via session
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Invalid Session ID");
    const sessionData = await sessionRes.json();
    if (!sessionData.user_id) throw new Error("Session has no user_id");
    const callerId = sessionData.user_id;

    // 2. Verify caller is admin/super_admin
    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!callerRes.ok) throw new Error("Failed to fetch caller");
    const callerData = await callerRes.json();
    
    // Tenta pegar o role do Clerk ou do Banco de Dados
    let callerRole = callerData.public_metadata?.role;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!callerRole && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const dbCallerRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${callerId}&select=role`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            }
        });
        const dbCallerData = await dbCallerRes.json();
        callerRole = dbCallerData[0]?.role;
    }

    if (callerRole !== 'admin' && callerRole !== 'super_admin') {
       throw new Error("Unauthorized (Not Admin)");
    }

    // 3. Find target user in Clerk
    const targetRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const targetData = await targetRes.json();
    const targetUser = targetData[0];
    
    if (!targetUser) {
        // Se não tem no Clerk mas tem no banco, a gente "finge" sucesso pra limpar o banco
        return new Response(JSON.stringify({ success: true, message: "User not in Clerk" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    const { action } = await req.clone().json();

    if (action === 'delete') {
        // EXCLUSÃO REAL NO CLERK
        const delRes = await fetch(`https://api.clerk.com/v1/users/${targetUser.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
        });
        if (!delRes.ok) throw new Error("Failed to delete user from Clerk");
    } else {
        // 4. Update target user's metadata
        const updateRes = await fetch(`https://api.clerk.com/v1/users/${targetUser.id}/metadata`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${CLERK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                public_metadata: { 
                role,
                unit_id: unitId || targetUser.public_metadata?.unit_id
                }
            }),
        });
        if (!updateRes.ok) throw new Error("Failed to update Clerk metadata");
    }

    // 5. Update Supabase profiles
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        if (action === 'delete') {
            await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                }
            });
        } else {
            await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(email)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ 
                    role: role,
                    unit_id: unitId || undefined
                })
            });
        }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
