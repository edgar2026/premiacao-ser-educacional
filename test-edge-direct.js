async function test() {
  const SUPABASE_URL = "https://mdzcrzrsavqfqfjnkgeg.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kemNyenJzYXZxZnFmam5rZ2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTQ2ODMsImV4cCI6MjA4NDE5MDY4M30.HR3EF9preHb_YUJummTWjXoEM_fu8wFV9BAIIL8eeYQ";

  const r = await fetch(`${SUPABASE_URL}/functions/v1/create-clerk-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      email: "testdirect@example.com",
      firstName: "Direct",
      lastName: "Test",
      password: "12345678",
      role: "diretor",
      unitId: "",
      sessionId: "sess_fake_test_123"
    })
  });

  console.log("Status:", r.status);
  const t = await r.text();
  console.log("Body:", t);
}

test();
