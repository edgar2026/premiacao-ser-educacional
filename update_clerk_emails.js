
const CLERK_SECRET_KEY = 'sk_test_PNalfIULMiOQaxOn64dzkf21izvnQwCm0PipUYj7ni';

const templates = [
    {
        slug: 'password_changed',
        name: 'Password Changed',
        subject: '🔒 Segurança: Sua senha foi alterada com sucesso',
        body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #001529 0%, #002a4d 100%); padding: 40px 20px; text-align: center; }
        .logo { max-height: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee; }
        h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        p { margin-bottom: 20px; font-size: 16px; }
        .button { display: inline-block; padding: 14px 30px; background-color: #D4AF37; color: #001529 !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .info-box { background-color: #f0f4f8; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
        .warning { color: #d93025; font-size: 14px; margin-top: 30px; border-top: 1px dashed #e0e0e0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ser Educacional</h1>
        </div>
        <div class="content">
            <p>Olá{{#user.first_name}}, <strong>{{user.first_name}}</strong>{{/user.first_name}},</p>
            <p>Este é um aviso automático para confirmar que a senha da sua conta <strong>{{user.primary_email_address}}</strong> foi alterada com sucesso.</p>
            
            <div class="info-box">
                <strong>Detalhes da Alteração:</strong><br>
                Data: {{current_date}}<br>
                Sistema: Portal de Premiações Ser Educacional
            </div>

            <p>Se você realizou esta alteração, pode ignorar este e-mail. Suas novas credenciais já estão ativas.</p>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="https://ser-educacional-premios.vercel.app/login" class="button">Acessar o Sistema</a>
            </div>

            <div class="warning">
                <strong>⚠️ Não foi você?</strong><br>
                Se você não solicitou esta alteração, sua conta pode estar em risco. Entre em contato com o suporte de TI imediatamente ou tente redefinir sua senha agora mesmo.
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2026 Ser Educacional - Sistema de Gestão de Mérito<br>Este é um e-mail automático, por favor não responda.</p>
        </div>
    </div>
</body>
</html>
        `
    },
    {
        slug: 'reset_password_code',
        name: 'Reset Password Code',
        subject: '🔑 Código de Recuperação de Senha - Ser Educacional',
        body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #001529 0%, #002a4d 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee; }
        h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .code-box { background-color: #f0f4f8; border: 2px dashed #D4AF37; padding: 30px; margin: 30px 0; text-align: center; border-radius: 12px; }
        .code { font-size: 36px; font-weight: bold; color: #001529; letter-spacing: 8px; }
        .warning { color: #d93025; font-size: 14px; margin-top: 30px; border-top: 1px dashed #e0e0e0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Recuperação de Acesso</h1>
        </div>
        <div class="content">
            <p>Olá{{#user.first_name}}, <strong>{{user.first_name}}</strong>{{/user.first_name}},</p>
            <p>Você solicitou a recuperação de senha para sua conta no <strong>Portal de Premiações Ser Educacional</strong>.</p>
            
            <p>Utilize o código abaixo para prosseguir com a redefinição:</p>
            
            <div class="code-box">
                <div class="code">{{otp_code}}</div>
            </div>

            <p>Este código expira em breve. Por favor, não compartilhe este código com ninguém.</p>

            <div class="warning">
                <strong>⚠️ Não solicitou esta alteração?</strong><br>
                Se você não tentou recuperar sua senha, pode ignorar este e-mail com segurança. Nenhuma alteração foi feita na sua conta ainda.
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2026 Ser Educacional - Sistema de Gestão de Mérito<br>Este é um e-mail automático, por favor não responda.</p>
        </div>
    </div>
</body>
</html>
        `
    }
];

async function updateTemplates() {
    for (const template of templates) {
        console.log("Atualizando template: " + template.slug + "...");
        try {
            const response = await fetch("https://api.clerk.com/v1/templates/email/" + template.slug, {
                method: 'PUT',
                headers: {
                    'Authorization': "Bearer " + CLERK_SECRET_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: template.name,
                    subject: template.subject,
                    body: template.body
                })
            });

            const text = await response.text();
            if (response.ok) {
                console.log("✅ Template " + template.slug + " atualizado com sucesso!");
            } else {
                console.error("❌ Erro ao atualizar " + template.slug + ":", text);
            }
        } catch (error) {
            console.error("❌ Erro na requisição para " + template.slug + ":", error);
        }
    }
}

updateTemplates();
