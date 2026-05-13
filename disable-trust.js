async function test() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";
  
  // The user ID for edgar.tavares@mauriciodenassau.edu.br
  const userId = "user_38j0sWcg2Zw5ii04MtnyyAxkS6k";
  
  // Update the user
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bypass_client_trust: true
    })
  });
  
  const data = await res.json();
  console.log("Update result:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
