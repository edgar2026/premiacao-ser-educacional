# Configuração de E-mail para Notificações de Senha

## 📧 Visão Geral

O sistema está configurado para enviar e-mails de confirmação após troca de senha em duas situações:
1. **Primeiro Acesso** - Quando o usuário cria sua senha pela primeira vez
2. **Redefinição de Senha** - Quando o usuário usa o fluxo "Esqueci minha senha"

## ✅ O que já foi implementado

- ✅ Edge Function criada: `send-password-changed-email`
- ✅ Template de e-mail HTML profissional com design Ser Educacional
- ✅ Integração nas páginas `FirstAccessPage` e `UpdatePasswordPage`
- ✅ Tratamento de erros (se o e-mail falhar, a senha ainda é alterada)

## 🔧 Como Ativar o Envio Real de E-mails

Atualmente, a Edge Function está **simulando** o envio de e-mails. Para enviar e-mails reais, você precisa configurar um serviço de envio. Recomendamos o **Resend** (muito simples e gratuito até 3.000 emails/mês).

### Opção 1: Usar Resend (Recomendado)

1. **Criar conta no Resend**
   - Acesse: https://resend.com
   - Crie uma conta gratuita

2. **Obter API Key**
   - No dashboard do Resend, vá em "API Keys"
   - Crie uma nova chave
   - Copie a chave (ex: `re_123456789...`)

3. **Configurar domínio (opcional mas recomendado)**
   - No Resend, adicione seu domínio (ex: `sereducacional.com`)
   - Configure os registros DNS conforme instruções
   - Verifique o domínio

4. **Adicionar Secret no Supabase**
   - Acesse o Supabase Dashboard
   - Vá em: Project Settings → Edge Functions → Secrets
   - Adicione um secret:
     - Nome: `RESEND_API_KEY`
     - Valor: `sua_api_key_do_resend`

5. **Atualizar a Edge Function**
   
   Execute este comando para atualizar a função com o código que usa Resend de verdade:

   ```bash
   # Criar arquivo atualizado
   mkdir -p supabase/functions/send-password-changed-email
   ```

   Depois crie o arquivo `supabase/functions/send-password-changed-email/index.ts` com:

   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

   const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

   serve(async (req) => {
     try {
       const { email, username } = await req.json();

       if (!email) {
         return new Response(
           JSON.stringify({ error: 'Email is required' }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       if (!RESEND_API_KEY) {
         console.warn('RESEND_API_KEY not configured');
         return new Response(
           JSON.stringify({ success: true, message: 'Email sending is not configured' }),
           { status: 200, headers: { 'Content-Type': 'application/json' } }
         );
       }

       // Enviar e-mail via Resend
       const resendResponse = await fetch('https://api.resend.com/emails', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${RESEND_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           from: 'Ser Educacional <noreply@sereducacional.com>', // Ajuste conforme seu domínio
           to: email,
           subject: 'Senha Alterada com Sucesso - Ser Educacional',
           html: `
             <!DOCTYPE html>
             <html>
             <head>
               <style>
                 body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #001529; margin: 0; padding: 0; }
                 .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #051139 0%, #0a1645 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2); }
                 .header { background: rgba(212, 175, 55, 0.1); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
                 .content { padding: 40px 30px; color: #F9FAFB; }
                 h1 { color: #D4AF37; font-size: 28px; margin: 0 0 20px 0; font-weight: 700; }
                 p { color: #F9FAFB; line-height: 1.6; margin: 16px 0; opacity: 0.9; }
                 .success-icon { font-size: 48px; margin: 20px 0; }
                 .footer { background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center; color: rgba(249, 250, 251, 0.4); font-size: 12px; }
                 .highlight { color: #D4AF37; font-weight: 600; }
               </style>
             </head>
             <body>
               <div class="container">
                 <div class="header">
                   <div class="success-icon">✓</div>
                   <h1>Senha Alterada com Sucesso!</h1>
                 </div>
                 <div class="content">
                   <p>Olá${username ? `, <span class="highlight">${username}</span>` : ''},</p>
                   <p>Sua senha foi alterada com sucesso no <span class="highlight">Portal de Premiações Ser Educacional</span>.</p>
                   <p>A partir de agora, você pode acessar o sistema administrativo utilizando suas novas credenciais.</p>
                   <p><strong>Detalhes da alteração:</strong></p>
                   <ul style="color: rgba(249, 250, 251, 0.9); line-height: 1.8;">
                     <li>Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</li>
                     <li>E-mail: ${email}</li>
                   </ul>
                   <p style="margin-top: 30px;">Se você não realizou esta alteração, entre em contato imediatamente com o suporte de TI.</p>
                 </div>
                 <div class="footer">
                   <p>© ${new Date().getFullYear()} Ser Educacional - Sistema de Gestão de Mérito</p>
                   <p>Este é um e-mail automático, não responda.</p>
                 </div>
               </div>
             </body>
             </html>
           `
         })
       });

       if (!resendResponse.ok) {
         const errorData = await resendResponse.json();
         throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
       }

       const data = await resendResponse.json();
       console.log('Email sent successfully:', data);

       return new Response(
         JSON.stringify({ success: true, message: 'Email sent successfully', data }),
         { status: 200, headers: { 'Content-Type': 'application/json' } }
       );

     } catch (error) {
       console.error('Error sending email:', error);
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   });
   ```

6. **Deploy da função atualizada**
   
   Eu posso fazer isso por você quando você configurar a API Key!

### Opção 2: Usar SMTP Nativo do Supabase

Você também pode configurar SMTP personalizado no Supabase:

1. Vá em: Project Settings → Auth → SMTP Settings
2. Configure com suas credenciais SMTP (ex: Gmail, Outlook, servidor próprio)
3. A Edge Function pode usar o serviço SMTP configurado

## 📊 Como Testar

1. **Teste local (sem e-mail real)**:
   - Abre o console do navegador (F12)
   - Troque qualquer senha
   - Verifique os logs: você verá uma mensagem de sucesso

2. **Teste com Resend configurado**:
   - Configure a API Key
   - Troque a senha
   - Verifique a caixa de entrada do e-mail cadastrado

## 🔒 Segurança

- ✅ A Edge Function NÃO requer JWT (`verify_jwt: false`) porque pode ser chamada após troca de senha
- ✅ Apenas envia e-mail - não expõe dados sensíveis
- ✅ Se falhar, não afeta a troca de senha (resiliente)

## 📝 Próximos Passos

1. [ ] Criar conta no Resend
2. [ ] Adicionar domínio no Resend (opcional)
3. [ ] Configurar `RESEND_API_KEY` no Supabase
4. [ ] Atualizar Edge Function com código do Resend
5. [ ] Testar envio real de e-mail

---

**Nota**: Como alternativa mais simples, você pode usar os templates de e-mail nativos do Supabase Auth. Porém, eles não incluem confirmação de troca de senha bem-sucedida, apenas links de redefinição.
