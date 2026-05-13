async function test() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";
  
  // Fetch instance settings
  const res = await fetch("https://api.clerk.com/v1/instance", {
    headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
  });
  const data = await res.json();
  
  console.log("Instance settings:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
