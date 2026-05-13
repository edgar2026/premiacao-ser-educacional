async function test() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";
  
  // Fetch users to see their authentication types
  const res = await fetch("https://api.clerk.com/v1/users", {
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
  });
  const users = await res.json();
  
  const userData = users.map(u => ({
    email: u.email_addresses[0].email_address,
    password_enabled: u.password_enabled,
    two_factor_enabled: u.two_factor_enabled,
    verification_status: u.email_addresses[0].verification?.status,
    id: u.id
  }));
  
  console.log("Users:", JSON.stringify(userData, null, 2));
}

test().catch(console.error);
