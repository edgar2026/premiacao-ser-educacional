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
    const { email, role, unitId, sessionId, targetUserId: providedTargetId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!email || !role || !sessionId) throw new Error("Missing parameters");

    // 1. Verify caller via their Session ID using Clerk API
    const sessionRes = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    if (!sessionRes.ok) throw new Error("Invalid Session ID");
    const sessionData = await sessionRes.json();
    if (sessionData.status !== 'active') throw new Error("Session is not active");
    
    const callerId = sessionData.user_id;

    // 2. Fetch caller to verify they are an admin
    const callerRes = await fetch(`https://api.clerk.com/v1/users/${callerId}`, {
         headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const callerData = await callerRes.json();
    if (callerData.public_metadata?.role !== 'admin' && callerData.public_metadata?.role !== 'super_admin') {
       throw new Error("Unauthorized (Not Admin)");
    }

    // 3. Find target user in Clerk
    const targetRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const targetData = await targetRes.json();
    const targetUser = targetData[0];
    if (!targetUser) throw new Error("User not found in Clerk");

    // 4. Update the target user's role and unit_id in Clerk
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

    // 5. Also update in Supabase profiles using Supabase URL and SUPABASE_SERVICE_ROLE_KEY
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        // Attempt to update the profile table directly via REST
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
    
    return new Response(JSON.stringify({ success: true }), {
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
