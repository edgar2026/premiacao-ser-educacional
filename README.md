# 🏆 Ser Prêmios (Ser Educacional)

> [!IMPORTANT]
> **Bússola do Projeto:** Para uma visão técnica detalhada de arquitetura, padrões e tecnologias, consulte o arquivo [PROJETO.md](./PROJETO.md).

Este é o sistema de gestão de premiações e mérito acadêmico do grupo **Ser Educacional**. O projeto foi concebido para oferecer uma experiência "Premium" e cinematográfica, celebrando as conquistas dos homenageados com elegância e tecnologia de ponta.

---

## ✨ Diferenciais do Projeto

*   **Design Cinematográfico:** Interface rica em texturas de granulado fotográfico, gradientes dinâmicos e tipografia clássica (*Playfair Display*).
*   **Gestão Híbrida de Auth:** Autenticação robusta com **Clerk** integrada a perfis dinâmicos no **Supabase**.
*   **Painel Administrativo Poderoso:** Controle total sobre homenageados, premiações, unidades geográficas, mídias da home e **gestão completa de usuários**.
*   **Workflow de Aprovação:** Fluxo completo com status (Rascunho → Em Análise → Aprovado/Reprovado → Publicado), tela de pendências para admin e acompanhamento para diretores.
*   **RBAC Dinâmico:** Menu lateral e rotas controlados por nível de acesso (admin vê tudo, diretor vê Homenageados + Minhas Solicitações).
*   **CRUD de Usuários:** Criar, editar, alterar cargo/unidade e excluir usuários diretamente pelo painel, com sincronização automática Clerk ↔ Supabase.
*   **Experiência do Usuário (UX):** Transições fluidas com *Framer Motion*, mapas interativos e editores de conteúdo rico.

---

## 🛠️ Tecnologias Principais

*   **Frontend:** React 18, TypeScript, Vite
*   **Estilização:** Tailwind CSS 4.x
*   **Backend:** Supabase (DB & Edge Functions)
*   **Auth:** Clerk (Enterprise-ready)

---

## 🔐 Níveis de Acesso

| Role           | Menu                    | Acesso                                              |
|:---------------|:------------------------|:----------------------------------------------------|
| `super_admin`  | Todos os 8 itens        | Acesso total a todas as funcionalidades              |
| `admin`        | Todos os 8 itens        | Acesso total a todas as funcionalidades              |
| `diretor`      | Homenageados + Solicitações | Gestão e acompanhamento de homenageados          |
| `public`       | Apenas "Homenageados"   | Visualização básica                                  |

---

## 🔄 Workflow de Aprovação

```
RASCUNHO → EM ANÁLISE → APROVADO → PUBLICADO
                   ↓
              REPROVADO (com justificativa) → Diretor corrige → EM ANÁLISE
```

| Tela                    | Acesso   | Rota                          |
|:------------------------|:---------|:------------------------------|
| Central de Análise      | Admin    | `/admin/aprovacoes`           |
| Minhas Solicitações     | Diretor  | `/admin/minhas-solicitacoes`  |
| Lista de Homenageados   | Todos    | `/admin/homenageados`         |

---

## ⚙️ Edge Functions (Supabase)

| Função                        | Descrição                                          |
|:------------------------------|:---------------------------------------------------|
| `create-clerk-user`           | Cria usuário no Clerk + Supabase                   |
| `update-clerk-user`           | Atualiza dados do usuário (nome, cargo, unidade)   |
| `delete-clerk-user`           | Remove usuário (Soft Delete)                       |
| `set-clerk-role`              | Altera papel/role de um usuário                    |
| `send-password-changed-email` | Confirmação de troca de senha                      |
| `notify-rejection`            | Notificação de alteração de status (email)          |

---

## 🚀 Como Começar

### Pré-requisitos
Certifique-se de ter o arquivo `.env.local` configurado com as chaves necessárias do Clerk e Supabase.

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

---

## 👤 Administrador do Sistema

A conta principal do sistema é `edgareda2015@gmail.com` com role `super_admin`. Todos os demais usuários devem ser criados a partir do **Painel de Gestão de Usuários** (`/admin/usuarios`).

---

## 📂 Documentação Relacionada

| Documento | Descrição |
| :--- | :--- |
| [PROJETO.md](./PROJETO.md) | **Principal**: Arquitetura, tecnologias, RBAC e regras de negócio. |
| [AUTH_FIX_EMERGENCY.md](./docs/AUTH_FIX_EMERGENCY.md) | Histórico de correções críticas no sistema de login. |
| [EMAIL_CONFIG.md](./docs/EMAIL_CONFIG.md) | Guia de configuração para ativação de disparos de e-mail. |

---

© 2026 Ser Educacional - Todos os direitos reservados.
