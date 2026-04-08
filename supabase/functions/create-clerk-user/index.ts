import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY") || "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, password, role, unitId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!email || !password || !role || !sessionId) throw new Error("Missing parameters");

    // 1. Verify caller is admin via session
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Invalid Session ID");
    const sessionData = await sessionRes.json();
    if (!sessionData.user_id) throw new Error("Session has no user_id");
    const callerId = sessionData.user_id;

    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!callerRes.ok) throw new Error("Failed to fetch caller");
    const callerData = await callerRes.json();
    if (callerData.public_metadata?.role !== 'admin' && callerData.public_metadata?.role !== 'super_admin') {
       throw new Error("Unauthorized (Not Admin)");
    }

    // 2. Create target user in Clerk
    const createRes = await fetch(`https://api.clerk.com/v1/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password: password,
        skip_password_checks: true,
        first_name: firstName,
        last_name: lastName,
        public_metadata: { 
          role,
          unit_id: unitId || undefined,
          force_password_change: true
        }
      }),
    });

    if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.errors?.[0]?.long_message || errData.errors?.[0]?.message || "Failed to create user");
    }

    const newUser = await createRes.json();

    // 3. Insert into Supabase profiles
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
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
                full_name: `${firstName} ${lastName}`.trim(),
                role: role,
                unit_id: unitId || null
            })
        });
    }

    return new Response(JSON.stringify({ success: true, user: newUser }), {
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
