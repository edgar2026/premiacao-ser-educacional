# 🏆 Projeto: Ser Prêmios (Ser Educacional)

Este documento atua como a **Bússola Diretiva** para desenvolvedores e assistentes de IA envolvidos na sustentação e evolução do sistema *Ser Prêmios*. Ele define as fundações tecnológicas, de design e arquitetura do projeto.

---

## 🎨 Pilar de Design e Estética (A "Gala Editorial")

O sistema exige uma apresentação **Premium, Institucional e Cinematográfica**, projetada para celebrar a excelência, o mérito corporativo e acadêmico.

### Regras de Direção de Arte
1. **Paleta Mestra**: Fundo Navy profundo (marinho) com destaques em Ouro Metálico (`gold` no Tailwind) e tipografia primária Off-white.
2. **Tipografia Premium**: 
   - Títulos e Destaques: **Playfair Display** (Serif)
   - Corpo do Texto e UI: **Inter** ou **Montserrat** (Sans-serif)
3. **Efeitos Visuais**:
   - **Glassmorphism**: Menus e overlays com efeitos "cristal fosco" usando `backdrop-blur` e bordas douradas sutis (`bg-white/[0.02] border-white/5`).
   - **Grain Texture**: Utilização de malhas e filtros de sombreamento (gradientes mesh) para aplicar profundidade visual (*Depth*).
   - **Motion Design**: Todo o projeto baseia-se pesadamente em *Framer Motion* para animações cinematográficas (transições de rotas, micro-interações ao pairar o mouse em cards, entradas de página). Modificações visuais devem, mandatoriamente, ter harmonia cinética.
4. **Versão Mobile**: O conceito *Mobile-First* é absoluto. O luxo não pode quebrar responsividade.

---

## 🚀 Pilares Tecnológicos

- **Core & Build**: React 18 + TypeScript + Vite.
- **Estilização**: Tailwind CSS v4 + Lucide React (Ícones).
- **Roteamento**: React Router Dom v7.
- **Ecossistema Back-end**: 
  - **Supabase**: PostgreSQL (Autenticação, Dados, RLS, Storage de Mídias, Funções RPC).
  - **Clerk**: Gestão de identidade de usuários, segurança OTP e sessões B2B. A integração com o Supabase é feita via Tokens e sincronização por Webhooks/Edge Functions.
- **Bibliotecas Críticas**:
  - `framer-motion` (Animações de entrada e viewport).
  - `recharts` (Visualização de métricas e performance administrativa).
  - `react-leaflet` / `leaflet` (Mapas e visualização regional).
  - `react-easy-crop` (UX para crop e ajuste no upload de imagens de homenageados).
  - `html2pdf.js` & `jspdf` (Geração de comprovantes e laudas de certificados).

---

## 🔐 Controle de Acesso, RLS e Organização Geográfica

O modelo de dados obedece estritamente a uma segregação de governança institucional. 

### Divisão Geográfica
As entidades da organização são fracionadas em hierarquia de localização para restringir quem vê o quê:
`Marca (Brand)` -> `Regional` -> `Unidade (Unit)`.

### Role-Based Access Control (RBAC) e Supabase RLS
Os níveis de permissão (`super_admin`, `admin`, `diretor`, `public`) validam a leitura e gravação no DB, implementadas através de **Row Level Security (RLS)**:

1. **Super Administradores (`super_admin`)**:
   - **Poder Absoluto**: Unificação técnica dos cargos `admin` e `super_admin`.
   - Acesso irrestrito a todo o módulo Administrativo (`/admin/*`).
   - Isentos de restrições de `unit_id` (Visão Global).
   - Podem cadastrar Premiações, Usuários (Mapeamento Clerk-Supabase), Marcas, Regionais, Unidades e gerenciar a mídia da Home.
2. **Diretores (`diretor`)**:
   - **Restrição de RLS**: Diretores SÓ podem cadastrar, visualizar e editar os **Homenageados** vinculados às **suas referidas** Unidades. Tentar acessar rotas ou injetar CUD em unidades das quais não têm poder hierárquico retorna Erro de Permissão.
   - Limitados às rotas de `/admin/homenageados/*`.
3. **Diretores Executivos (`diretor_executivo`)**:
   - **Visão Estratégica**: Possuem permissão de leitura global (RLS similar ao Admin) para todos os Homenageados, Unidades e Regionais, permitindo uma análise consolidada de toda a rede.
   - **Interface Restrita**: O menu é filtrado para exibir apenas o **Dashboard Estratégico** e a listagem de **Homenageados**, ocultando ferramentas de configuração técnica (Prêmios, Geografia, Usuários) para foco em BI e análise.
   - Rotas concentradas em `/admin/dashboard` e `/admin/homenageados`.
4. **Público (`public`)**:
   - Apenas leitura (Galeria Geral, Sobre, Linha do Tempo, Detalhes Públicos de Prêmios).

### Fluxo de Aprovação de Homenageados
1. Diretor cadastra Homenageado via Wizard (Stepper interativo), definindo a Biografia, os Dados Profissionais e Anexos.
2. Entra com Status **`pending`**.
3. O Admin recebe no Dashboard, analisa os critérios e altera o Status para **`approved`**.
4. Apenas se aprovado E possuir a tag booleana **`is_published = true`**, o homenageado é listado publicamente para consulta externa e indexação.

### Sincronização e Gestão de Usuários (Clerk ↔ Supabase)
A gestão de usuários é híbrida e resiliente a bloqueios de rede:
1. **Edge Functions**: As operações críticas são processadas via **Supabase Edge Functions** para garantir bypass de RLS e integração segura com Clerk:
   - `create-clerk-user`: Cria no Clerk e espelha no Supabase com `ativo: true`.
   - `sync-clerk-users`: Varre todo o Clerk e atualiza a tabela `profiles` (Upsert), garantindo que todos os usuários existentes estejam ativos.
   - `set-clerk-role`: Altera `public_metadata` no Clerk (Roles de sistema).
   - `sync-clerk-profile`: Sincroniza dados individuais (nome, email, cargo) forçando a ativação do perfil. Possui flag `forceRole` para permitir revogação total de acesso.
2. **Exclusão Atômica (Remoção Definitiva)**: No painel administrativo, a exclusão de um usuário executa uma limpeza física:
   - Apaga o usuário permanentemente do **Clerk**.
   - Apaga o registro da tabela **`profiles`** no Supabase.
   - Caso o banco possua vínculos históricos (FKs), o sistema executa um *downgrade* forçado para `role: public`, removendo todo e qualquer poder de acesso.

---

## 🔄 Versionamento por Semestres e Configuração Global

- **Semestres Dinâmicos**: A separação das edições da premiação é fundamentada por "Semestres" no banco de dados.
- **Identidade Semestral Visual**: Para distiguir as edições no painel visual, algoritmos como o *Golden Angle Algorithm* (`H = (index * 137.508) % 360`) podem ser usados programaticamente na UI para gerar matizes consistentes, porém distintos, na colorização de badges dos prêmios baseados na string do semestre original.
- **Semestre Padrão (Default)**: O sistema salva a preferência ou carrega um semestre ativo por omissão assim que a aplicação é iniciada.

---

## 📂 Arquitetura de Pastas

```bash
/src
  /components        # Elementos reutilizáveis (UI: Inputs de vidro, Layouts)
  /features          # Módulos centrais (Verdadeira separação de conceitos)
    /auth            # Lógica B2B com Clerk e Guards (`RoleGuard`)
    /home            # Apresentação do Hero (HomeMedia) e Rankings Top Regionais
    /admin           # Lógica do Painel ADM (Controles de RLS e Cadastros Geográficos)
    /awards          # Entidades e categorias de Prêmios
    /honoree         # Cadastro e Exibição de Perfil do Homenageado
  /layouts           # Embrulho Master (Main Público VS. Admin Dashboard)
  /lib               # Singleton e Injeção do Supabase (`supabase.ts`)
  /types             # Interfaces TypeScript e auto-geráveis do Supabase (`global.ts`)
  /utils             # Helpers de parser seguro
```

---

## 🛠 Comandos de Sustentação

- `npm run dev`: Build local.
- `node promote-edgar.js`: Adicionar cargo super-admin a usuário inicial no Postgres.
- `node update_clerk_emails.js`: Sincronizador de base do Clerk via Server-Side CLI.
- `npx supabase functions deploy <nome-da-funcao>`: Atualizar lógica no servidor (Requer privilégios).

- **Deploy Engine**: Totalmente compatível e rodando sob Vercel (Roteamentos via arquivo `vercel.json` no root controlam o redirect de Single Page Application para a index).

---

> _Lembre-se: Menos é Mais visualmente, mas Tecnologicamente a precisão deve ser cirúrgica. Siga a TypeScript de forma estrita (`no any`) e proteja as sessões do Clerk com a chave do Perfil no Supabase._
