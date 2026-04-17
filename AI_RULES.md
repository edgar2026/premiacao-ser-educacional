# 🤖 Diretrizes e Regras do Projeto (AI_RULES)

Este documento define o ecossistema tecnológico do projeto **Ser Prêmios** e estabelece as regras estritas que assistentes de IA devem seguir ao modificar o código.

## 🚀 Tech Stack (Pilares Tecnológicos)

- **Frontend Core:** React 18, TypeScript, Vite.
- **Estilização e UI:** Tailwind CSS v4 para layout e design system. Uso de *Glassmorphism* avançado, `framer-motion` para animações fluidas e pacote `lucide-react` / Material Symbols para iconografia.
- **Roteamento:** React Router Dom v7, com rotas privadas (Auth Guard).
- **Backend & Database:** Supabase (PostgreSQL, RLS Rules, Edge Functions, Storage).
- **Identidade e Segurança:** Clerk Auth B2B gerindo sessões via JWT/OTP, sincronizado com tabelas do Supabase via Webhooks.
- **Editor de Texto e UX:** `react-quill-new` para Rich Text, `react-easy-crop` para processamento de avatares in-browser.

## 📜 Regras Estritas de Edição (Para a IA)

1. **Obrigatoriedade de Tags:** Use SEMPRE a tag `<dyad-write>` para saídas de código. O uso de blocos Markdown (```) para código estrutural é terminantemente proibido.
2. **Design Cinematográfico:** Toda nova interface DEVE seguir o layout *Premium* (Fundos `navy-deep`, destaques em `gold`, desfoque de fundo com classes `glass-card`). Sem exceções.
3. **Respeito ao RLS (Supabase):** Nunca altere chaves estrangeiras ou lógicas de *Row Level Security* sem explícita necessidade de negócio. A separação por Unidades/Marcas deve ser mantida.
4. **Sem Excesso de Engenharia:** Não adicione `try/catch` redundantes para "engolir" erros. Erros não tratados devem explodir no console de forma controlada para debug via Error Boundaries.
5. **Componentização Limitada:** Novos componentes devem ter responsabilidade única e tamanho ideal (até 150 linhas). Se ficar complexo, fatie o arquivo e passe como `children`.
6. **Integração de Componentes:** Tente usar sempre os recursos visuais preexistentes na pasta `src/components/ui/` (ex: `GlassCard`, `ConfirmModal`, `PremiumVideoPlayer`).
7. **Bibliotecas Externas:** Antes de injetar dependências (npm), avalie se não é possível resolver usando lógicas nativas (Hooks) ou componentes já instalados no `package.json`.