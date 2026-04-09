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
    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");

    // 1. Fetch ALL users from Clerk
    const clerkRes = await fetch(`https://api.clerk.com/v1/users?limit=500`, {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    
    if (!clerkRes.ok) {
        throw new Error("Failed to fetch users from Clerk");
    }
    const clerkUsers = await clerkRes.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase env vars in Edge Function");
    }

    let syncCount = 0;

    // 2. Upsert each into Supabase
    for (const u of clerkUsers) {
        const primaryEmailObj = u.email_addresses.find(e => e.id === u.primary_email_address_id) || u.email_addresses[0];
        const email = primaryEmailObj ? primaryEmailObj.email_address : '';
        const firstName = u.first_name || '';
        const lastName = u.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const role = u.public_metadata?.role || 'public';
        const unitId = u.public_metadata?.unit_id || null;

        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${u.id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                username: email,
                full_name: fullName,
                role: role,
                unit_id: unitId
            })
        });

        // Try insert as well (upsert alternative since PATCH doesn't create if missing)
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({ 
                id: u.id,
                username: email,
                full_name: fullName,
                role: role,
                unit_id: unitId,
                ativo: true
            })
        });
        
        syncCount++;
    }

    return new Response(JSON.stringify({ success: true, count: syncCount }), {
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
