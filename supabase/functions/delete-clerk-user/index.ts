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
    const { email, targetUserId, sessionId } = await req.json();

    if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY");
    if (!sessionId || (!email && !targetUserId)) throw new Error("Missing target user identifiers");

    // 1. Verify caller is admin
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

    let clerkUserIdToDelete = targetUserId;

    if (!clerkUserIdToDelete && email) {
        const targetRes = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
        });
        const targetData = await targetRes.json();
        const targetUser = targetData[0];
        if (!targetUser) throw new Error("User not found in Clerk");
        clerkUserIdToDelete = targetUser.id;
    }
    
    if (clerkUserIdToDelete === callerId) throw new Error("Admins cannot delete themselves");

    // 2. Delete target user in Clerk
    const deleteRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserIdToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });

    if (!deleteRes.ok) {
        const errData = await deleteRes.json();
        throw new Error(errData.errors?.[0]?.message || "Failed to delete user");
    }

    // 3. Delete from Supabase profiles
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${clerkUserIdToDelete}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ ativo: false })
        });
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
