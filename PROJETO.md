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
  /utils             # Funções auxiliares (Helper functions)
/supabase
  /functions         # Edge Functions (RBAC, Email automation)
```

---

## 🔑 Fluxos Principais e Segurança

### 1. Sistema de Autenticação (Clerk + Supabase)
O projeto utiliza um sistema híbrido:
- **Clerk:** Gerencia o login social, e-mail/senha, sessões seguras e IDs de organização.
- **Supabase Profiles:** Armazena dados complementares e papéis (roles) para controle de acesso fino no banco de dados.
- **Sincronização:** Quando um usuário loga pela primeira vez via Clerk, um perfil é criado automaticamente no Supabase via RPC (`create_clerk_profile`).

### 2. Níveis de Acesso (RBAC)
Os papéis são definidos na tabela `profiles` e verificados pelo `RoleGuard`:
- **`super_admin` / `admin`**: Acesso total ao painel administrativo (`/admin`), incluindo gestão de usuários, geografia e mídia da home.
- **`diretor`**: Acesso ao painel administrativo para gestão de homenageados, mas com restrições em configurações globais e usuários.
- **`public`**: Acesso apenas às áreas de consulta e visualização do site institucional.

### 3. Gestão de Homenageados e Workflow de Aprovação
O sistema possui um fluxo de governança para novos registros:
1. **Cadastro**: Realizado em etapas (Stepper) por Diretores ou Admins.
2. **Status `pending`**: O registro aguarda revisão.
3. **Status `approved`**: O registro foi validado por um Administrador.
4. **Publicação (`is_published`)**: Somente após a aprovação e a marcação de "Publicado", o homenageado aparece na galeria pública.
- **Edição Dinâmica**: Suporte a crop de imagens em tempo real para garantir o padrão visual.

### 4. Edge Functions
Utilizadas para tarefas que exigem privilégios elevados ou integrações externas:
- **`set-clerk-role`**: Sincroniza a alteração de papel entre a interface administrativa do Supabase e o metadata do usuário no Clerk.
- **`send-password-changed-email`**: (Em desenvolvimento/SIMULAÇÃO) Envia confirmação de troca de senha via Resend.

---

## 🛠 Manutenção e DevOps

### Comandos de Desenvolvimento
- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Gera o bundle de produção.
- `npm run lint`: Checagem estática de código.

### Scripts de Administração (Root)
- `promote-edgar.js`: Script Node.js para promover o usuário admin inicial no Supabase.
- `update_clerk_emails.js`: Script utilitário para manutenção de emails no Clerk.

---

## 📝 Notas para o Assistente (IA)
Sempre que abrir este projeto, leia este arquivo para entender o contexto de:
1. **Padrão de Nomeclatura:** PascalCase para Componentes, camelCase para funções/variáveis.
2. **Estilização:** Tailwind CSS v4 sempre priorizado. Utilize gradientes mesh e texturas premium.
3. **Tipagem:** Nunca use `any`. Utilize `supabase.ts` gerado para o schema do banco.
4. **Auth:** O `AuthContext` é o centro da verdade para permissões de usuários. Use `useAuth()` para acessar o perfil logado.

---

## ✨ Melhorias Premium (Implementadas)
1. **Tipografia de Luxo:** Mix entre *Playfair Display* e *Montserrat*.
2. **Efeitos de Vidro (Glassmorphism):** Menus e overlays com `backdrop-blur` e bordas sutis.
3. **Grain Texture:** Camada de ruído visual para depth cinematográfico.
4. **Motion Design:** Uso extensivo de `framer-motion` para transições suaves entre rotas e revelação de conteúdo.

