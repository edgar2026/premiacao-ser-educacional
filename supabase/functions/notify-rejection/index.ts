import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { honoreeName, directorEmail, reason, status } = await req.json();

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!directorEmail || !status) {
      throw new Error("Missing parameters");
    }

    let subject = "";
    let html = "";

    if (status === 'reprovado') {
      subject = `Atualização de Status: Cadastro de ${honoreeName} Reprovado`;
      html = `
        <div style="font-family: serif; padding: 40px; background: #0a0e14; color: #f8f9fa; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-style: italic;">Atualização de Curadoria</h1>
          <p>Olá,</p>
          <p>Informamos que o cadastro do homenageado <strong>${honoreeName}</strong> foi revisado pela administração e marcado como <strong>REPROVADO</strong>.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: rgba(255,255,255,0.4); letter-spacing: 2px;">Motivo da Reprovação:</p>
            <p style="margin: 10px 0 0 0; font-style: italic;">"${reason || 'Nenhum motivo especificado.'}"</p>
          </div>
          <p>Por favor, realize os ajustes necessários no painel administrativo para submeter uma nova análise.</p>
          <hr style="border: 0; border-top: 1px solid rgba(212,175,55,0.2); margin: 30px 0;">
          <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Premios Ser Educacional - Excelência e Mérito</p>
        </div>
      `;
    } else if (status === 'aprovado' || status === 'publicado') {
        subject = `Sucesso: Cadastro de ${honoreeName} Aprovado!`;
        html = `
        <div style="font-family: serif; padding: 40px; background: #0a0e14; color: #f8f9fa; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-style: italic;">Excelência Confirmada</h1>
          <p>Olá,</p>
          <p>Parabéns! O cadastro do homenageado <strong>${honoreeName}</strong> foi <strong>APROVADO</strong> e está pronto para visualização.</p>
          <div style="background: rgba(212,175,55,0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
             <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #d4af37; letter-spacing: 2px;">Status Atual:</p>
             <p style="margin: 10px 0 0 0; font-weight: bold;">${status.toUpperCase()}</p>
          </div>
          <p>Obrigado por contribuir com a memória histórica da nossa instituição.</p>
          <hr style="border: 0; border-top: 1px solid rgba(212,175,55,0.2); margin: 30px 0;">
          <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Premios Ser Educacional - Excelência e Mérito</p>
        </div>
      `;
    }

    if (!html) {
        return new Response(JSON.stringify({ success: true, message: "No email needed for this status" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ser Premios <noreply@premios.sereducacional.com>",
        to: directorEmail,
        subject: subject,
        html: html,
      }),
    });

    const resData = await res.json();

    return new Response(JSON.stringify(resData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
