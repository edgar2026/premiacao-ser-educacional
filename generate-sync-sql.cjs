const fs = require('fs');

async function syncUsers() {
  const CLERK_SECRET_KEY = "sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni";

  try {
    console.log('Buscando usuários no Clerk...');
    const createRes = await fetch(`https://api.clerk.com/v1/users?limit=500`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      }
    });

    if (!createRes.ok) {
        throw new Error('Falha ao buscar clerk: ' + createRes.status);
    }

    const users = await createRes.json();
    console.log(`Encontrados ${users.length} usuários. Gerando arquivo SQL para sincronização...`);

    let sql = `-- Script Gerado Automaticamente para Sincronizar Clerk com Supabase\n`;
    sql += `-- Rode isso no SQL Editor do Supabase\n\n`;

    sql += `-- 1. Corrigir a tabela profiles para aceitar IDs do Clerk e ter a coluna "ativo"\n`;
    sql += `ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;\n`;
    sql += `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;\n`;
    sql += `ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;\n`;
    sql += `ALTER TABLE public.profiles ADD PRIMARY KEY (id);\n\n`;

    sql += `-- 2. Sincronizando usuários...\n`;

    users.forEach(u => {
        const primaryEmailObj = u.email_addresses.find(e => e.id === u.primary_email_address_id) || u.email_addresses[0];
        const email = primaryEmailObj ? primaryEmailObj.email_address : '';
        const firstName = u.first_name || '';
        const lastName = u.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim().replace(/'/g, "''"); // Escape single quotes
        const username = email.replace(/'/g, "''");
        let role = u.public_metadata?.role || 'public';
        let unit_id = u.public_metadata?.unit_id ? `'${u.public_metadata.unit_id}'` : 'NULL';

        sql += `INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) \n`;
        sql += `VALUES ('${u.id}', '${username}', '${fullName}', '${role}', ${unit_id}, true)\n`;
        sql += `ON CONFLICT (id) DO UPDATE SET \n`;
        sql += `  username = EXCLUDED.username,\n`;
        sql += `  full_name = EXCLUDED.full_name,\n`;
        sql += `  role = EXCLUDED.role,\n`;
        sql += `  unit_id = EXCLUDED.unit_id;\n\n`;
    });

    fs.writeFileSync('sync-clerk-to-supabase.sql', sql);
    console.log('----------------------------------------------------');
    console.log('✅ SUCESSO! O arquivo `sync-clerk-to-supabase.sql` foi criado na raiz do seu projeto.');
    console.log('👉 Siga os passos:');
    console.log('1. Abra e copie todo o conteúdo do arquivo `sync-clerk-to-supabase.sql`.');
    console.log('2. Vá no Painel do Supabase -> SQL Editor -> New Query.');
    console.log('3. Cole o código e clique em RUN.');
    console.log('4. Atualize a tela do seu sistema, e todos os usuários aparecerão!');
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('Erro:', err);
  }
}

syncUsers().catch(console.error);
