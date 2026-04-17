# 🏆 Ser Prêmios (Ser Educacional) - Sistema de Gestão de Mérito

> 🟢 **STATUS: V1.0 ESTÁVEL - PRONTO PARA PRODUÇÃO**

Este é o ecossistema institucional definitivo de gestão de premiações e mérito corporativo/acadêmico do grupo **Ser Educacional**. Arquitetado com foco em uma experiência do usuário "Premium" (*gala editorial*), segurança impenetrável e fluxos de aprovação hierárquicos.

---

## ✨ Destaques da Plataforma

*   **Design Cinematográfico:** UI responsiva com *Glassmorphism*, texturas premium, tipografia serifada clássica (*Playfair Display*) e animações fluidas via *Framer Motion*.
*   **Motor de Curadoria:** Workflow completo de aprovação de homenageados (Rascunho ➔ Análise ➔ Correção/Aprovação ➔ Publicação).
*   **Geopolítica Institucional Escalonável:** Banco de dados estruturado na hierarquia **Marca -> Regional -> Unidade**. 
*   **Segurança (RLS & Clerk):** Row Level Security nativa do PostgreSQL. Um diretor só interage com o que pertence ao seu campus; Administradores governam o sistema global.
*   **Gestão Resiliente:** Painel de administração de acessos projetado para funcionar mesmo sob restrições severas de rede corporativa e AdBlockers.

---

## 🛠️ Stack Tecnológica

*   **Frontend Core:** React 18, TypeScript, Vite
*   **Estilização:** Tailwind CSS v4
*   **Banco de Dados & Storage:** Supabase (PostgreSQL)
*   **Autenticação B2B:** Clerk Auth
*   **Gráficos & Dados:** Recharts
*   **Mapas Geográficos:** React-Leaflet

---

## 🚀 Guia de Inicialização (Deploy / Dev)

### 1. Variáveis de Ambiente (`.env.local`)
Para executar o projeto, você precisará configurar as variáveis obrigatórias:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_CLERK_PUBLISHABLE_KEY=sua_chave_clerk_aqui
VITE_CLERK_ORGANIZATION_ID=opcional_id_da_org
```

### 2. Rodando Localmente
```bash
npm install
npm run dev
```

### 3. Deploy (Vercel / Netlify)
O projeto já está empacotado para deploy em plataformas Serverless.
O arquivo `vercel.json` garante o redirecionamento correto (Rewrite) do tráfego para o `index.html` gerido pelo React Router.

---

## 📚 Documentações Auxiliares

| Arquivo | Descrição |
| :--- | :--- |
| **[STATUS_ENTREGA.md](./STATUS_ENTREGA.md)** | **[NOVO]** Checklist de homologação de todas as funcionalidades atestando a estabilidade da V1. |
| **[PROJETO.md](./PROJETO.md)** | Diretrizes arquiteturais e regras de negócio (Pilar do sistema). |
| **[AI_RULES.md](./AI_RULES.md)** | Contexto do ecossistema e limites de modificação de código. |

---

*Desenvolvido sob rigorosos padrões de excelência para o Grupo Ser Educacional.*