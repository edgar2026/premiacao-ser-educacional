# 🏆 Ser Prêmios (Ser Educacional)

> [!IMPORTANT]
> **Bússola do Projeto:** Para uma visão técnica detalhada de arquitetura, fluxos restritos, design system de alto padrão e stack profunda, consulte as diretrizes arquiteturais em [PROJETO.md](./PROJETO.md).

Este é o ecossistema institucional de gestão de premiações e mérito corporativo/acadêmico do grupo **Ser Educacional**. Arquitetado com foco obsessivo em uma experiência do usuário "Premium" (estilo *gala editorial*), segregação profunda de segurança de banco de dados por diretores de unidades e painéis imersivos.

---

## ✨ Identidade e Fundamentos

*   **Design Cinematográfico:** UI desenhada sob conceitos de luxo, adotando texturas de granulado fotográfico, tipografia clássica serifada (*Playfair Display*), paletas baseadas em Azul Marinho Profundo, Ouro e elementos de "vidro" (*Glassmorphism*).
*   **Gestão de Identidade Híbrida:** Integração enterprise atuando com o **Clerk** (Login, Sessão B2B OTP) comunicando via JWT e Webhooks com as políticas RLS do **Supabase**.
*   **Geopolítica Institucional:** Segmentação administrativa baseada no triângulo **Marca -> Regional -> Unidade**. O RLS assegura que "Diretores" gerenciem apenas a própria paróquia (unidade), enquanto "Administradores" governam o ecossistema e aprovam pendências.
*   **Integração Contínua Funcional:** Suporte a edições e histórico multissemetral de homenagens, gráficos executivos, geração de credenciais on-the-fly (`html2pdf`) e uploads controlados (com crop nativo inline).
*   **Motion Total:** Transições de tela perfeitamente cronometradas usando *Framer Motion* para consolidar a credibilidade da navegação.

---

## 🛠️ Stack Principal

*   **Frontend Core:** React 18, TypeScript, Vite
*   **Motor CSS:** Tailwind CSS 4.x
*   **BaaS (Gestão de Dados & Permissão):** Supabase (PostgreSQL, RLS Rules, Edge DB, Storage)
*   **B2B Auth:** Clerk 

---

## 🚀 Guia Rápido

### Pré-requisitos
A aplicação não iniciará sem a simbiose de chaves da dupla *Clerk* + *Supabase*. Verifique e preencha o `.env.local` usando o layout padrão.

### Instalação
```bash
npm install
```

### Inicialização (Dev Server)
```bash
npm run dev
```

---

## 📂 Documentação e Suportes de Manutenção

| Arquivo Ref | Função e Contexto |
| :--- | :--- |
| **[PROJETO.md](./PROJETO.md)** | **Manifesto Principal**. Definições arquiteturais e regras de negócio. |
| **[docs/AUTH_FIX_EMERGENCY.md](./docs/AUTH_FIX_EMERGENCY.md)** | Tratamentos de contingência para eventuais syncs falhos entre Clerk<>Supabase. |
| **[docs/EMAIL_CONFIG.md](./docs/EMAIL_CONFIG.md)** | Definições de disparo automático (`Resend`/Edges) configurados. |

---

## 👤 Scripts Administrativos de Raiz

Na raiz do projeto existem rotinas em Node (sem uso webpack) voltadas a correções diretas no Banco. Exemplo, para promover a semente zero do super administrador:
```bash
node promote-edgar.js
```
*(Confirme variáveis internas do script. Precisa ter runtime Node disponível localmente)*

---

*© 2026 Grupo Ser Educacional - Inovação Corporativa*
