# 1. Visão Geral do Sistema

## O que é o Ser Prêmios?
O **Ser Prêmios** é uma plataforma institucional da Ser Educacional destinada a celebrar a excelência corporativa e acadêmica. O sistema permite o cadastro, aprovação e exibição de homenageados vinculados a unidades geográficas da instituição, garantindo governança estruturada através de uma plataforma Web robusta.

## Proposta de Valor
A plataforma centraliza a indicação das premiações e o monitoramento em tempo real (Painel Administrativo) do fluxo de nomeações e resultados, enquanto atua como uma vitrine pública premium (Galeria) de homenagem aos profissionais de destaque.

## Características de UX/UI
O design atende a uma "Gala Editorial", baseada em um tema noturno (Navy profundo) com dourado (Gold). É altamente dependente de:
* **Glassmorphism:** Componentes com fundo semi-transparente, usando `backdrop-blur`.
* **Motion Design:** Animações interativas cinéticas via `framer-motion` presentes nas chegadas aos fluxos visuais.
* **Componentes de Dados Dinâmicos:** Mapas interativos (Leaflet) e Gráficos gerenciais (Recharts).

## Pilares Tecnológicos
O projeto é suportado por duas frentes de infraestrutura (Serverless/BaaS):
1. **Frontend**: React 18, Vite, Tailwind CSS v4, TypeScript, React Router Dom v7.
2. **Backend/BaaS**: Supabase (PostgreSQL + Row-Level Security RLS + Edge Functions + Storage).
3. **Autenticação**: Clerk B2B (Segurança de login e gestão de Identidade da Conta). Paridade constante garantida entre o Banco Supabase e a base Clerk via Edge Functions.
