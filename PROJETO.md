# 🏆 Projeto: Ser Prêmios (Ser Educacional)

Este documento serve como a **Bússola do Projeto** para desenvolvedores e assistentes de IA, garantindo que a estrutura, tecnologias e funcionalidades sejam compreendidas instantaneamente.

---

## 🚀 Pilares Tecnológicos

- **Frontend:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS 4.x](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Ícones)
- **Autenticação:** [Clerk](https://clerk.com/) (para gestão de usuários e sessões)
- **Backend / DB:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Roteamento:** [React Router Dom v7](https://reactrouter.com/)
- **Componentes Específicos:**
  - `recharts`: Gráficos e visualização de dados
  - `leaflet` & `react-leaflet`: Mapas e geolocalização
  - `react-easy-crop`: Edição de imagens de perfil/capa
  - `react-quill`: Editor de texto rico para descrições
  - `html2pdf.js` & `jspdf`: Geração automática de certificados/relatórios

---

## 📂 Arquitetura de Pastas

A estrutura segue o padrão de **Feature-Based Design**, onde cada módulo tem suas próprias páginas e componentes específicos.

```bash
/src
  /components        # Componentes globais (UI, Common)
  /features          # Módulos principais com lógica de negócio
    /about           # Página Sobre
    /admin           # Painel Administrativo (Gestão de Homenageados, Prêmios, Mídia, Geografia)
    /auth            # Lógica de Login, Redefinição de Senha e AuthContext
    /awards          # Galeria e Detalhes de Prêmios
    /dashboard       # Dashboard Executivo (Gráficos e estatísticas)
    /gallery         # Galeria de Mídia do Projeto
    /home            # Homepage e Conteúdo Principal
    /honoree         # Homenageados (Detalhes, Galeria)
    /partners        # Lista de Parceiros
    /timeline        # Linha do Tempo e marcos históricos
  /layouts           # Templates de Layout (Main, Admin, Dashboard)
  /lib               # Configurações de API (Supabase Client)
  /services          # Lógica de acesso a dados (mockData e chamadas Supabase)
  /types             # Definições de tipos TypeScript
  /utils             # Funções auxiliares e formatadores
```

---

## 🔑 Fluxos Principais

### 1. Autenticação e Níveis de Acesso
- **Público:** Home, Sobre, Linha do Tempo, Galeria, Homenageados (Consulta), Prêmios (Consulta).
- **Dashboard Executivo:** `/dashboard` - Acesso a métricas consolidadas.
- **Administrador:** `/admin` - Gestão total do sistema (Homenageados, Prêmios, Conteúdo dinâmico).
- **Proteção:** Utiliza `ProtectedRoute` e `AuthContext` integrados com Clerk e filtros customizados de acesso.

### 2. Gestão de Homenageados
- Fluxo de cadastro em etapas (Stepper) para garantir integridade dos dados (Informações Básicas, Biografia, Mídia, Unidades/Marcas).
- Edição dinâmica de fotos com crop integrado.

### 3. Painel Administrativo
- Controle de **Geografia**: Gestão de Unidades e Marcas do grupo Ser Educacional.
- Controle de **Home Media**: Edição dinâmica de banners e conteúdos da página inicial.

---

## 🛠 Comandos Úteis

- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Gera o bundle de produção otimizado.
- `npm run lint`: Executa a verificação estática do código.

---

## 📝 Notas para o Assistente (IA)
Sempre que abrir este projeto, leia este arquivo para entender o contexto de:
1. **Padrão de Nomeclatura:** PascalCase para Componentes, camelCase para funções/variáveis.
2. **Estilização:** CSS utilitário (Tailwind) sempre priorizado. Evite estilos inline.
3. **Tipagem:** Nunca use `any`. Utilize os arquivos em `/types` ou crie interfaces locais.
4. **Auth:** O `AuthContext` é o centro da verdade para permissões de usuários.
