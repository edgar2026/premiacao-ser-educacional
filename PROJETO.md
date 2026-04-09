# 🏆 Projeto: Ser Prêmios (Ser Educacional)

Este documento serve como a **Bússola do Projeto** para desenvolvedores e assistentes de IA, garantindo que a estrutura, tecnologias e funcionalidades sejam compreendidas instantaneamente.

---

## 🚀 Pilares Tecnológicos

- **Frontend:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS 4.x](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Ícones)
- **Autenticação:** [Clerk](https://clerk.com/) (Gestão de usuários, sessões e organizações)
- **Backend / DB:** [Supabase](https://supabase.com/) (PostgreSQL + Edge Functions + Realtime)
- **Roteamento:** [React Router Dom v7](https://reactrouter.com/)
- **Componentes Específicos:**
  - `framer-motion`: Animações cinematográficas
  - `recharts`: Gráficos e visualização de dados
  - `leaflet` & `react-leaflet`: Mapas e geolocalização de unidades
  - `react-easy-crop`: Edição de imagens de perfil/capa
  - `react-quill`: Editor de texto rico para biografias
  - `html2pdf.js` & `jspdf`: Geração automática de certificados/relatórios

---

## 📂 Arquitetura de Pastas

A estrutura segue o padrão de **Feature-Based Design**, onde cada módulo tem suas próprias páginas e componentes específicos.

```bash
/src
  /components        # Componentes globais (UI, Common, Layout Elements)
  /features          # Módulos principais com lógica de negócio
    /about           # Página Sobre
    /admin           # Painel Administrativo (Homenageados, Prêmios, Mídia, Usuários)
    /auth            # Lógica de Login, Contexto de Auth e Proteção de Rotas
    /awards          # Galeria e Detalhes de Prêmios
    /dashboard       # Dashboard Executivo (Métricas acumuladas)
    /gallery         # Galeria de Mídia do Projeto
    /home            # Homepage e Conteúdo Principal
    /honoree         # Homenageados (Detalhes, Galeria Pública)
    /partners        # Lista de Parceiros
    /timeline        # Linha do Tempo e marcos históricos
  /layouts           # Templates de Layout (Main, Admin, Dashboard)
  /lib               # Configurações de API (Supabase Client)
  /services          # Mock data e serviços de integração
  /types             # Definições de tipos TypeScript e Types do Supabase
  /utils             # Funções auxiliares (Helper functions, traduções Clerk)
/supabase
  /functions         # Edge Functions (CRUD de usuários, RBAC, Email)
```

---

## 🔑 Fluxos Principais e Segurança

### 1. Sistema de Autenticação (Clerk + Supabase)

O projeto utiliza um sistema híbrido de autenticação:

- **Clerk:** Gerencia o login social, e-mail/senha, sessões seguras e IDs de organização.
- **Supabase Profiles:** Armazena dados complementares e papéis (roles) para controle de acesso fino no banco de dados.
- **Sincronização Automática:** Quando um usuário loga pela primeira vez via Clerk, um perfil é criado automaticamente no Supabase via RPC (`create_clerk_profile`).

#### Estrutura da Tabela `profiles`

| Coluna           | Tipo     | Descrição                                              |
|:-----------------|:---------|:-------------------------------------------------------|
| `id`             | `TEXT`   | ID do Clerk (ex: `user_38jBWE...`). **Chave primária** |
| `username`       | `TEXT`   | E-mail do usuário (**UNIQUE**)                         |
| `full_name`      | `TEXT`   | Nome completo                                          |
| `role`           | `TEXT`   | Papel: `super_admin`, `admin`, `diretor`, `public`     |
| `unit_id`        | `UUID`   | FK para tabela `units` (unidade vinculada)             |
| `regional_id`    | `UUID`   | FK para tabela `regionals`                             |
| `brand_id`       | `UUID`   | FK para tabela `brands`                                |
| `organization_id`| `TEXT`   | ID da organização Clerk                                |
| `ativo`          | `BOOLEAN`| Soft delete (default: `true`)                          |
| `primeiro_acesso`| `BOOLEAN`| Indica se é o primeiro login                           |
| `avatar_url`     | `TEXT`   | URL do avatar                                          |

> **IMPORTANTE:** O campo `id` é do tipo `TEXT` (não UUID) para compatibilidade com os IDs gerados pelo Clerk. Todas as políticas RLS utilizam `auth.uid()::text` para comparação.

#### Busca de Perfil (AuthContext.tsx)

O `AuthContext` busca o perfil seguindo esta estratégia:
1. **Primeiro:** Busca por `id` (Clerk user ID) — caminho principal
2. **Fallback:** Busca por `username` (e-mail) — compatibilidade

```typescript
// Tenta pelo ID do Clerk
const byId = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
// Fallback pelo e-mail
if (!byId.data) {
  const byEmail = await supabase.from('profiles').select('*').eq('username', email).maybeSingle();
}
```

---

### 2. Níveis de Acesso (RBAC)

Os papéis são definidos na tabela `profiles` e verificados pelo `RoleGuard` e pelo `Sidebar`:

| Role           | Descrição                | Acesso no Sistema                                   |
|:---------------|:-------------------------|:----------------------------------------------------|
| `super_admin`  | Administrador Master     | Acesso **total** a todas as telas e funcionalidades |
| `admin`        | Administrador            | Acesso **total** a todas as telas e funcionalidades |
| `diretor`      | Diretor de Unidade       | Homenageados + Minhas Solicitações                  |
| `public`       | Usuário Público          | Acesso **apenas** à tela de Homenageados            |

#### Controle no Menu Lateral (Sidebar.tsx)

O menu é **dinâmico** e renderiza apenas os itens permitidos:

- **Admin / Super Admin:** Vê todos os 8 itens do menu:
  - Dashboard, Painel de Controle, Homenageados, **Aprovações**, Prêmios, Gestão Regional, Mídia Home, Gestão de Usuários
- **Diretor / Outros:** Vê 2 itens:
  - Homenageados, **Minhas Solicitações**

```typescript
const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
const adminLinks = isAdmin
    ? allAdminLinks  // inclui 'Aprovações'
    : [
        { to: '/admin/homenageados', label: 'Homenageados' },
        { to: '/admin/minhas-solicitacoes', label: 'Minhas Solicitações' },
      ];
```

#### Proteção de Rotas (RoleGuard.tsx)

- Rotas protegidas pelo `RoleGuard` com `allowedRoles={['admin', 'super_admin']}`
- Usuários não autorizados são **redirecionados** automaticamente para `/admin/homenageados`
- Mesmo digitando a URL diretamente no navegador, o acesso é bloqueado

#### Rotas Protegidas

| Rota                           | Requer Admin? | Descrição                        |
|:-------------------------------|:--------------|:---------------------------------|
| `/admin`                       | Não*          | Painel de Controle               |
| `/admin/homenageados`          | Não           | Gestão de Homenageados           |
| `/admin/homenageados/novo`     | Não           | Cadastro de Homenageado          |
| `/admin/minhas-solicitacoes`   | Não           | **Status das Solicitações**      |
| `/admin/aprovacoes`            | **Sim**       | **Central de Análise (Aprovar/Recusar)** |
| `/admin/premios`               | **Sim**       | Gestão de Prêmios                |
| `/admin/geografia`             | **Sim**       | Gestão Regional                  |
| `/admin/home-media`            | **Sim**       | Mídia da Home                    |
| `/admin/dashboard`             | **Sim**       | Dashboard Estratégico            |
| `/admin/usuarios`              | **Sim**       | Gestão de Usuários               |

> *A rota `/admin` (Painel de Controle) redireciona automaticamente não-admins para `/admin/homenageados`.

---

### 3. Gestão de Usuários (CRUD Completo)

A tela `UsersAdminPage.tsx` oferece gestão completa de usuários com sincronização Clerk ↔ Supabase:

#### Funcionalidades

| Ação      | Descrição                                                              |
|:----------|:-----------------------------------------------------------------------|
| **Listar**| Exibe todos os usuários ativos da tabela `profiles` do Supabase        |
| **Criar** | Cria usuário no Clerk + insere no Supabase automaticamente             |
| **Editar**| Atualiza nome, sobrenome, cargo e unidade no Clerk e no Supabase       |
| **Excluir**| Remove o usuário do Clerk e do Supabase (Soft Delete via `ativo`)     |

#### Campos Editáveis (Modal de Edição)

- **Nome** — texto livre
- **Sobrenome** — texto livre
- **Cargo** — seletor: `Diretor`, `Administrador`, `Público`
- **Unidade** — seletor dinâmico (sempre editável, independente do cargo)

#### Fluxo de Criação de Usuário

```
[Admin clica "Cadastrar Usuário"]
   → Preenche: Nome, Sobrenome, Email, Senha, Cargo, Unidade
   → Edge Function `create-clerk-user`:
      1. Valida sessão do admin (Clerk API)
      2. Cria usuário no Clerk com `public_metadata.role`
      3. Insere perfil no Supabase (id = Clerk user ID)
   → Lista atualiza automaticamente
```

#### Fluxo de Edição de Usuário

```
[Admin clica "Editar"]
   → Modal com dados preenchidos
   → Edge Function `update-clerk-user`:
      1. Valida sessão do admin
      2. Atualiza nome/sobrenome e metadata no Clerk
      3. Atualiza `full_name`, `role`, `unit_id` no Supabase
   → Lista atualiza automaticamente
```

#### Fluxo de Exclusão de Usuário

```
[Admin clica "Excluir"]
   → Modal de confirmação
   → Edge Function `delete-clerk-user`:
      1. Valida sessão do admin
      2. Remove usuário do Clerk
      3. Marca `ativo = false` no Supabase (Soft Delete)
   → Lista atualiza automaticamente
```

---

### 4. Gestão de Homenageados e Workflow de Aprovação

O sistema possui um fluxo completo de governança com 5 status possíveis:

#### Status do Homenageado

| Status       | Badge           | Descrição                                                  |
|:-------------|:----------------|:-----------------------------------------------------------|
| `rascunho`   | Cinza           | Em edição pelo diretor, ainda não solicitou análise        |
| `em_analise` | Amarelo         | Diretor solicitou análise, aguardando decisão do admin     |
| `aprovado`   | Verde           | Aprovado pelo administrador, pronto para publicação        |
| `reprovado`  | Vermelho        | Recusado pelo admin com justificativa obrigatória          |
| `publicado`  | Azul            | Visível na galeria pública do site                         |

#### Fluxo Completo

```
┌──────────┐     Diretor clica      ┌────────────┐     Admin aprova     ┌───────────┐     Admin publica    ┌───────────┐
│ RASCUNHO │ ──────────────────────► │ EM ANÁLISE │ ──────────────────► │ APROVADO  │ ──────────────────► │ PUBLICADO │
└──────────┘   "Solicitar Análise"   └────────────┘                     └───────────┘                     └───────────┘
                                           │                                                                    │
                                           │ Admin recusa                                                       │
                                           │ (com justificativa)                                                │
                                           ▼                                                                    │
                                    ┌────────────┐     Diretor corrige                                          │
                                    │ REPROVADO  │ ─────────────────► volta para EM ANÁLISE                     │
                                    │(+motivo)   │   e reenvia                                                  │
                                    └────────────┘                          Admin despublica ◄──────────────────┘
```

#### Telas do Workflow

| Tela                          | Arquivo                    | Acesso    | Função                                                |
|:------------------------------|:---------------------------|:----------|:------------------------------------------------------|
| **Central de Análise**        | `ApprovalAdminPage.tsx`    | Admin     | Listar pendentes, aprovar ou recusar com justificativa|
| **Minhas Solicitações**       | `MyRequestsPage.tsx`       | Diretor   | Acompanhar status, ver motivos de recusa, corrigir    |
| **Lista Geral**               | `HonoreesAdminPage.tsx`    | Todos     | Tabela com badges de status e ações contextuais       |
| **Cadastro/Edição (Stepper)** | `HonoreeRegistrationPage`  | Todos     | Formulário em 5 etapas com envio automático           |

#### Ações por Role

**Diretor:**
- Cadastra homenageado → status começa como `em_analise` (enviado automaticamente ao salvar)
- Na lista, pode clicar "Solicitar Análise" (ícone `send`) em itens com status `rascunho` ou `reprovado`
- Na tela "Minhas Solicitações", vê todos os seus cadastros com status visual
- Se reprovado, vê o motivo da recusa e pode clicar "Corrigir e Reenviar"

**Admin:**
- Na "Central de Análise", filtra por status (Pendentes, Aprovados, Recusados, Todos)
- Pode **Aprovar** (botão verde) → status muda para `aprovado`
- Pode **Recusar** (botão vermelho) → abre modal exigindo **justificativa obrigatória**
- Na lista geral, pode **Publicar/Despublicar** itens aprovados
- Pode excluir qualquer homenageado

#### Modal de Recusa

Substitui o antigo `prompt()` por um modal premium com:
- Nome do homenageado exibido no cabeçalho
- Campo de texto obrigatório para a justificativa
- Botão desabilitado até que o motivo seja preenchido
- Design consistente com o restante do sistema (GlassCard + cores temáticas)

#### Campos do Banco de Dados (tabela `honorees`)

| Coluna             | Tipo              | Descrição                                          |
|:-------------------|:------------------|:---------------------------------------------------|
| `status`           | `TEXT` (enum)     | `rascunho`, `em_analise`, `aprovado`, `reprovado`, `publicado` |
| `rejection_reason` | `TEXT`            | Motivo da recusa (preenchido pelo admin)            |
| `created_by`       | `TEXT`            | ID do Clerk do criador (para filtrar por diretor)   |
| `is_published`     | `BOOLEAN`         | Flag de publicação na galeria pública               |

- **Edição Dinâmica**: Suporte a crop de imagens em tempo real para garantir o padrão visual.

---

### 5. Recuperação de Senha

O fluxo de recuperação funciona via Clerk:

1. Usuário clica em "Esqueci minha senha" na tela de login
2. Digita o **e-mail exato** cadastrado (case-sensitive)
3. Clerk envia um código de verificação por e-mail
4. Usuário é redirecionado para `/redefinir-senha`
5. Insere o código + nova senha (mín. 8 caracteres)
6. Sessão é criada automaticamente

> **ATENÇÃO:** O Clerk aplica rate limiting (limite de tentativas). Se o usuário tentar muitas vezes seguidas, receberá o erro "Muitas tentativas. Aguarde alguns minutos." — isso é uma proteção de segurança normal.

---

### 6. Edge Functions (Supabase)

Todas as Edge Functions ficam em `/supabase/functions/` e são deployadas no Supabase:

| Função                        | JWT? | Descrição                                                     |
|:------------------------------|:-----|:--------------------------------------------------------------|
| `create-clerk-user`           | Não  | Cria usuário no Clerk + Supabase (requer sessão admin)        |
| `update-clerk-user`           | Não  | Atualiza dados do usuário no Clerk + Supabase                 |
| `delete-clerk-user`           | Não  | Remove usuário do Clerk + Soft Delete no Supabase             |
| `set-clerk-role`              | Não  | Altera o papel/role de um usuário                             |
| `send-password-changed-email` | Não  | Envia confirmação de troca de senha (via Resend)              |

> **Segurança:** Todas as funções validam a sessão do chamador via API do Clerk e verificam que o `public_metadata.role` é `admin` ou `super_admin` antes de executar.

#### Deploy de Edge Functions

As Edge Functions podem ser deployadas via MCP do Supabase ou pelo CLI:

```bash
npx supabase functions deploy create-clerk-user --no-verify-jwt
npx supabase functions deploy update-clerk-user --no-verify-jwt
npx supabase functions deploy delete-clerk-user --no-verify-jwt
npx supabase functions deploy set-clerk-role --no-verify-jwt
```

---

### 7. Políticas de Segurança (RLS)

O banco de dados utiliza Row Level Security (RLS) em todas as tabelas principais:

#### Tabela `profiles`
- `Public profiles are viewable by everyone` — SELECT aberto
- `Users can insert their own profile` — INSERT com `auth.uid()::text = id`
- `Users can update own profile` — UPDATE com `auth.uid()::text = id`
- `admin_all` — Acesso total para `admin` e `super_admin`
- `diretor_select_profiles` — Diretor vê apenas perfis da mesma unidade

#### Tabela `units`
- `Admin Write Units` — Apenas admin/super_admin podem criar/editar unidades

#### Tabela `honoree_awards`
- `Admin Write Honoree Awards` — Apenas admin/super_admin podem gerenciar

#### Storage (`storage.objects`)
- `Admin Full Access` — Upload/download de arquivos restrito a admins autenticados

> **Cast obrigatório:** Todas as políticas usam `auth.uid()::text` pois o campo `id` da tabela `profiles` é do tipo `TEXT` (ID do Clerk), não `UUID`.

---

## 🛠 Manutenção e DevOps

### Variáveis de Ambiente Obrigatórias

```env
# Clerk (Frontend)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_ORGANIZATION_ID=org_...  # Opcional: restringe a uma organização

# Clerk (Backend / Edge Functions)
CLERK_SECRET_KEY=sk_test_...

# Supabase (Frontend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase (Edge Functions - configurado no dashboard)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Comandos de Desenvolvimento

- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Gera o bundle de produção.
- `npm run lint`: Checagem estática de código.

### Conta Administrador Principal

- **E-mail:** `edgareda2015@gmail.com`
- **Role:** `super_admin`
- **Clerk ID:** `user_38jBWEoJWrU5xryFwdDigtv8d8U`
- **Acesso:** Total a todas as telas e funcionalidades

> Esta é a conta do desenvolvedor e administrador do sistema. A partir dela, todos os demais usuários devem ser criados pelo painel de Gestão de Usuários.

---

## 📝 Notas para o Assistente (IA)

Sempre que abrir este projeto, leia este arquivo para entender o contexto de:

1. **Padrão de Nomeclatura:** PascalCase para Componentes, camelCase para funções/variáveis.
2. **Estilização:** Tailwind CSS v4 sempre priorizado. Utilize gradientes mesh e texturas premium.
3. **Tipagem:** Nunca use `any`. Utilize `supabase.ts` gerado para o schema do banco.
4. **Auth:** O `AuthContext` é o centro da verdade para permissões de usuários. Use `useAuth()` para acessar o perfil logado.
5. **IDs:** O campo `id` da tabela `profiles` é `TEXT` (não UUID) — compatível com IDs do Clerk.
6. **RBAC:** Sempre use `isAdmin` (admin ou super_admin) para verificar acesso administrativo. Nunca checar apenas por `isDiretor`.
7. **Edge Functions:** Toda operação privilegiada (criar/editar/excluir usuários) deve passar por Edge Functions que validam a sessão admin.
8. **Constraint UNIQUE:** O campo `username` na tabela `profiles` possui constraint UNIQUE para evitar duplicatas.

---

## ✨ Melhorias Premium (Implementadas)

1. **Tipografia de Luxo:** Mix entre *Playfair Display* e *Montserrat*.
2. **Efeitos de Vidro (Glassmorphism):** Menus e overlays com `backdrop-blur` e bordas sutis.
3. **Grain Texture:** Camada de ruído visual para depth cinematográfico.
4. **Motion Design:** Uso extensivo de `framer-motion` para transições suaves entre rotas e revelação de conteúdo.
5. **Tradução de Erros:** Mensagens do Clerk traduzidas para português via `clerkTranslations.ts`.
6. **Menu Dinâmico:** Sidebar renderiza apenas itens permitidos conforme role do usuário.
7. **Soft Delete:** Exclusão de usuários marca `ativo = false` em vez de deletar registro.

---

## 📋 Histórico de Migrações Críticas

### Migração: UUID → TEXT (profiles.id)
- **Data:** 2026-04-08
- **Motivo:** IDs do Clerk são strings (`user_xxx`), não UUIDs
- **Impacto:** Todas as políticas RLS recriadas com cast `::text`
- **Tabelas afetadas:** `profiles`, `units`, `honoree_awards`, `storage.objects`

### Limpeza: Duplicatas de Profiles
- **Data:** 2026-04-08
- **Motivo:** Migração UUID→TEXT deixou registros antigos (UUID) e novos (Clerk ID) com mesmo username
- **Ação:** Removidos registros com ID no formato UUID; mantidos apenas IDs com prefixo `user_`
- **Prevenção:** Adicionada constraint UNIQUE no campo `username`
