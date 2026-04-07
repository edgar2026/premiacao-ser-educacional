const SK='sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni';

async function run() {
    try {
        const res = await fetch('https://api.clerk.com/v1/users', { headers: { Authorization: 'Bearer ' + SK } });
        const users = await res.json();
        console.log('Users found:', users.length);
        
        for (const user of users) {
          const email = user.email_addresses[0]?.email_address;
          console.log('User:', email, 'ID:', user.id);
          
          // Promote to super_admin
          await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
              method: 'PATCH',
              headers: {
                  Authorization: `Bearer ${SK}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ public_metadata: { role: 'super_admin' } })
          });
          console.log('Promoted', email, 'to super_admin in Clerk');
        }
    } catch (e) {
        console.error(e);
    }
}
run();
