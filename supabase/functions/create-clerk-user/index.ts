import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY");
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
    const { firstName, lastName, email, password, role, unitId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");

    // 1. Autentica se quem está chamando é de fato Admin
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'active') throw new Error("Session is not active");
    
    const callerRes = await fetch(`https://api.clerk.com/v1/users/${sessionData.user_id}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const callerData = await callerRes.json();
    if (callerData.public_metadata?.role !== 'admin' && callerData.public_metadata?.role !== 'super_admin') {
       throw new Error("Unauthorized (Not Admin)");
    }

    // 2. Cria o usuário no Clerk
    const createRes = await fetch(`https://api.clerk.com/v1/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: [email],
        password: password,
        first_name: firstName,
        last_name: lastName,
        public_metadata: { role, unit_id: unitId || null },
        skip_password_checks: true,
        skip_password_requirement: true
      })
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      throw new Error(errData.errors?.[0]?.message || "Failed to create user in Clerk");
    }

    const newUser = await createRes.json();

    // 3. Cria instantaneamente o perfil espelhado no Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: newUser.id,
          username: email,
          full_name: fullName,
          role: role,
          primeiro_acesso: true,
          unit_id: unitId || null,
          ativo: true
        })
      });
    }

    return new Response(JSON.stringify({ success: true, user: newUser }), {
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