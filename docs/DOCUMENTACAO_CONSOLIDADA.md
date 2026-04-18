# DOCUMENTAÇÃO TÉCNICA CONSOLIDADA: SER PRÊMIOS

Este documento reúne toda a referência técnica, de negócios e de arquitetura do projeto **Ser Prêmios**, da Ser Educacional. Ele atua como guia definitivo para integrações, onboarding de desenvolvedores e manutenção da plataforma.

---

## 1. Visão Geral do Sistema

### O que é o Ser Prêmios?
O **Ser Prêmios** é uma plataforma institucional da Ser Educacional destinada a celebrar a excelência corporativa e acadêmica. O sistema permite o cadastro, aprovação e exibição de homenageados vinculados a unidades geográficas da instituição, garantindo governança estruturada através de uma plataforma Web robusta.

### Proposta de Valor
A plataforma centraliza a indicação das premiações e o monitoramento em tempo real (Painel Administrativo) do fluxo de nomeações e resultados, enquanto atua como uma vitrine pública premium (Galeria) de homenagem aos profissionais de destaque.

### Características de UX/UI
O design atende a uma "Gala Editorial", baseada em um tema noturno (Navy profundo) com dourado (Gold). É altamente dependente de:
* **Glassmorphism:** Componentes com fundo semi-transparente, usando `backdrop-blur`.
* **Motion Design:** Animações interativas cinéticas via `framer-motion` presentes nas chegadas aos fluxos visuais.
* **Componentes de Dados Dinâmicos:** Mapas interativos (Leaflet) e Gráficos gerenciais (Recharts).

### Pilares Tecnológicos
O projeto é suportado por duas frentes de infraestrutura (Serverless/BaaS):
1. **Frontend**: React 18, Vite, Tailwind CSS v4, TypeScript, React Router Dom v7.
2. **Backend/BaaS**: Supabase (PostgreSQL + Row-Level Security RLS + Edge Functions + Storage).
3. **Autenticação**: Clerk B2B (Segurança de login e gestão de Identidade da Conta). Paridade constante garantida entre o Banco Supabase e a base Clerk via Edge Functions.

---

## 2. Arquitetura do Sistema

### Padrão Frontend 
Foi adotada uma estruturação modular no React com `Vite`. Tudo parte do princípio de _Feature Sliced Design_ (Arquitetura orientada a Funcionalidades/Recursos).

```text
/src
  /components        # Elementos isolados (Inputs de vidro, Modais, GlassCard, etc.)
  /features          # Módulos centrais organizados por funcionalidade:
    /auth            # Lógicas de bloqueio, guards e contexto (RoleGuard)
    /home            # Renderizações focadas na landing page e navegação pública
    /admin           # Lógica pesada: CRUD de Premiações, Unidades, Usuários, Home.
    /awards          # Domínio restrito a prêmios e atributos das categorias
    /honoree         # Exibição (view) do homenageado no modo público
  /layouts           # Layouts macro do sistema (Admin e Público)
  /lib               # Instâncias e SDKs (Supabase)
  /types             # Tipagens TS estritas de todos os domínios
  /utils             # Parsers utilitários genéricos
```

### Arquitetura de Serviço (Serverless Backend)

1. **Clerk Auth**: Toma conta da porta de entrada e sessões.
2. **Supabase (PostgreSQL)**: Contém o modelo de domínio do negócio. Com as diretrizes de RLS (Row-Level Security), impede o acesso de dados com a permissão incorreta diretamente na camada do banco de dados, caso um payload customizado seja enviado indevidamente pela rede.
3. **Supabase Edge Functions (Deno)**: Atuam como os "Controllers" com poderes _bypass_ (ignoram RLS por usarem chave de serviço) entre o Banco de dados e a interface/autenticação:
   * **sync-clerk-users / sync-clerk-profile**: Rotinas chamadas de dentro do painel ou engatilhadas por um admin para garantir que a tabela `profiles` estampa (reflete) os usuários criados no Provider.
   * **set-clerk-role**: Promove ou expulsa níveis de _role_ de um usuário dentro da estrutura _public_metadata_ do Clerk, além da sua replicação no Supabase.

### Fluxo de Deploy Contínuo (CI/CD)
O projeto está configurado para deploy imediato e transparente na **Vercel**. Toda vez que há um commit no branch `main` no GitHub, o processo inicializa nativamente usando o comando mapeado no `package.json`: `pnpm run build` (que faz tanto a análise local typescript `tsc -b` e o Vite Build). Um arquivo `vercel.json` gerencia o redirecionamento seguro.

---

## 3. Modelagem de Banco de Dados (Supabase - PostgreSQL)

A integridade do negócio reflete hierarquias geográficas rígidas para viabilizar o controle administrativo granular e RLS.

### Entidades Principais

* **Regionais (`regionais`)**: 
  * Estruturas primárias. Ex: "Nordeste", "Sul".
* **Unidades (`units`)**: 
  * Associadas a uma Regional (`regional_id`) e a uma Marca (`brand_id`). São a entidade basilar onde diretores farão o cadastro da indicação.
* **Marcas (`brands`)**: 
  * Sub-franquias e logomarcas (Ex: Uninassau, Unama) do grupo educacional.
* **Premiações (`awards`)**: 
  * Guarda as configurações de ano, semestre e descrições do prêmio gerado. Para organização histórica com Semestres, cada nova premiação pode ter um `semester_id`.
* **Perfis de Usuários (`profiles`)**: 
  * Registro complementar das identidades criadas no Clerk. Reflete informações atômicas como nome, cargo (`super_admin`, `admin`, `diretor`, `diretor_executivo`). É vital que o `profiles.id` possua o **mesmo** chaveamento de UID gerado nativamente pelo token do Clerk Auth.
* **Homenageados (`honorees`)**: 
  * O registro *Master* do projeto. Nele são atreladas Foreign Keys (Chaves Estrangeiras) das outras tabelas como o prêmio ao qual foi indicado (`award_id`), em qual unidade atua (`unit_id`), as descrições da pessoa (história) gravada estaticamente via coluna json `professional_data`.

### Storage e Uploads (Buckets do Supabase)
As imagens de Perfil do homenageado, documentos probatórios ou logotipos de capa da `Home`, são geridas por buckets vinculados ao **Supabase Storage**. Todas respeitam o versionamento de chaves via timestamp para burlar "cache agressivo" em substituições de arquivo no front-end.

---

## 4. Fluxos, Permissões e Perfis (Roles)

### RLS (Row Level Security) e Acessos
O Banco restringe automaticamente as ações a depender do Perfil logado. Segue-se a árvore de governança corporativa:

#### Níveis de Usuário (Gestão B2B Clerk/Supabase)
1. **O Público (Sem restrição)**
   * **Papel:** Exclusão analítica de dados (Apenas Leitura).
   * **O que faz:** Somente podem olhar os dados abertos das Landing Pages, Timeline e a página individual do Homenageado.

2. **Diretor (`diretor`)**
   * **Papel**: Originador.
   * **O que faz**: Insere cadastros de indicações limitados restritamente ao radar da unidade ao qual pertence. O RLS rechaça qualquer comando de API caso tente recuperar ou alterar um homenageado criado em outra unidade onde não possui alçada. A visualização das listagens também é refatorada automaticamente pelo Banco de dados filtrando os resultados apenas para os de sua unidade base.
   
3. **Diretor Executivo (`diretor_executivo`)**
   * **Papel**: Consumo e Estratégia global.
   * **O que faz**: Acompanha o andamento do pipeline inteiro, de todas as marcas e todas as regionais ativas através do módulo de BI da plataforma (Dashboard Gerencial). Apenas pode "olhar o sistema todo" de forma administrativa. Não entra no cadastro de edições técnicas.

4. **Administrador (`admin` / `super_admin`)**
   * **Papel:** Moderador Master e Arquitetura do Sistema.
   * **O que faz:** Únicos com permissão de manipulação atômica via CRUD de "Configurações da Plataforma", entre eles alterar quem é diretor regional, que marcas existem, abrir novas cerimônias limitando as unificações, alterar o banner institucional e promover a **Exclusão ou Aprovação Definitiva** dos Homenageados pendentes nos pipelines dos diretores.

#### Ciclo de Vida da Aprovação de um Homenageado
Todo cadastrado entra no sistema preenchendo um longo formulário "Stepper Interativo".
1. **Estado Rascunho / Pendente**: Assim que concluído por um diretor local, o Homenageado ganha um selo (`em_analise` ou `draft`).
2. **Dashboard de Resolução**: O Admin avalia as informações. Tivemos fluxos criados dentro da aba "Aprovação" no painel ADM, onde são lidos os documentos anexados.
3. **Aprovação**: Se verificado o aval, o Admin clica para Aprovar. O homenageado ganha tag de status para `aprovado`. Se possuir a condição extra booleana preenchida indicando sua pronta divulgação (`is_published: true`) o profissional passará a figurar visualmente na galeria principal pública de forma instantânea.

---

## 5. Roteamento e Dicas Técnicas de Sustentação

As rotas são governadas pelo `react-router-dom` v7 no arquivo fundamental `App.tsx`:

### Resumo Rotas Restritas (Administrativas)
Exigem que o Context encapsulado pelo Clerk identifique sessões válidas. Estão dentro do pacote `AdminLayout` e protegidas com `<RoleGuard>`.

* `/admin/dashboard` - Painel Master, estatísticas.
* `/admin/homenageados` - Entidade Principal para visualização e CRUD de indicações.
* `/admin/aprovacoes` - Fila pipeline e esteira de aprovação.
* `/admin/premios` | `/admin/marcas` | `/admin/unidades` | `/admin/home-media` - Configurações fundamentais abertas para Super Admins.
* `/admin/usuarios` - Espelho das sub-contas criadas no Clerk. Onde ocorre as remoções atômicas e elevação de privilégios.

### Resumo de Rotas Públicas
Abertas aos visitantes externos, encapsulados no pacote do `PublicLayout`.
* `/` (Home)
* `/sobre`
* `/galeria` - Linha do tempo interativa por prêmio.
* `/homenageado/:id` - A renderização definitiva "Single Page" do profissional laureado que é compartilhada.

### Principais Dependências 
Para a equipe de dev atentar no ato de manutenção visual ou sistêmica futuramente:
* **Para PDFs**: Utiliza-se a dobradinha de `html2canvas` para "bater prints do DOM invisível" aliado ao `jspdf` ou `html2pdf.js` para renderizar o tamanho A4 da folha de aprovação.
* **Para Gráficos**: Recharts.
* **Upload via Corte**: `react-easy-crop` garante o _aspect-ratio_ do perfil de todos os professores indicados (reduzindo poluição visual da grid home).

### Dicas Rápidas de Configuração Contínua:
* Ao dar fork ou clone, criar o `.env` com todas as chaves de **Public Supabase Anon Key**, **API do Supabase (URL)** e **Publishable Key do Clerk**.
* O Clerk necessita de _Webhooks Secret_ salvos das variáveis do Edge Functions para permitir uma sincronicidade bidirecional real time.
* Evitar apagar o UID Master Admin no Clerk manual. Sempre use o dashboard interno do projeto para não quebrar tabelas relacionais do banco.
