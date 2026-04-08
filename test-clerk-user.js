async function test() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";

  const email = "test_user_from_script2@example.com";
  const password = "123";
  const firstName = "Test";
  const lastName = "User";

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
    }),
  });

  const body = await createRes.json();
  console.log("Status:", createRes.status);
  console.log("Body:", JSON.stringify(body, null, 2));
}

test().catch(console.error);
