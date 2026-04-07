# 🏆 Ser Prêmios (Ser Educacional)

> [!IMPORTANT]
> **Bússola do Projeto:** Para uma visão técnica detalhada de arquitetura, padrões e tecnologias, consulte o arquivo [PROJETO.md](./PROJETO.md).

Este é o sistema de gestão de premiações e mérito acadêmico do grupo **Ser Educacional**. O projeto foi concebido para oferecer uma experiência "Premium" e cinematográfica, celebrando as conquistas dos homenageados com elegância e tecnologia de ponta.

---

## ✨ Diferenciais do Projeto

*   **Design Cinematográfico:** Interface rica em texturas de granulado fotográfico, gradientes dinâmicos e tipografia clássica (*Playfair Display*).
*   **Gestão Híbrida de Auth:** Autenticação robusta com **Clerk** integrada a perfis dinâmicos no **Supabase**.
*   **Painel Administrativo Poderoso:** Controle total sobre homenageados, premiações, unidades geográficas e mídias da home.
*   **Experiência do Usuário (UX):** Transições fluidas com *Framer Motion*, mapas interativos e editores de conteúdo rico.

---

## 🛠️ Tecnologias Principais

*   **Frontend:** React 18, TypeScript, Vite
*   **Estilização:** Tailwind CSS 4.x
*   **Backend:** Supabase (DB & Edge Functions)
*   **Auth:** Clerk (Enterprise-ready)

---

## 🚀 Como Começar

### Pré-requisitos
Certifique-se de ter o arquivo `.env.local` configurado com as chaves necessárias do Clerk e Supabase.

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

---

## 📂 Documentação Relacionada

| Documento | Descrição |
| :--- | :--- |
| [PROJETO.md](./PROJETO.md) | **Principal**: Arquitetura, tecnologias e regras de negócio. |
| [AUTH_FIX_EMERGENCY.md](./docs/AUTH_FIX_EMERGENCY.md) | Histórico de correções críticas no sistema de login. |
| [EMAIL_CONFIG.md](./docs/EMAIL_CONFIG.md) | Guia de configuração para ativação de disparos de e-mail. |

---

## 👤 Scripts de Administração

Para promover o primeiro administrador do sistema, utilize:
```bash
node promote-edgar.js
```
*(Certifique-se de preencher as variáveis no script antes de executar)*

---

© 2026 Ser Educacional - Todos os direitos reservados.

