async function test() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";
  const res = await fetch("https://api.clerk.com/v1/users", {
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
  });
  const users = await res.json();
  const userData = users.map(u => ({ email: u.email_addresses[0].email_address, role: u.public_metadata?.role }));
  console.log(JSON.stringify(userData, null, 2));
}

test().catch(console.error);
