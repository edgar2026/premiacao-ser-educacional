# 5. Roteamento e Dicas Técnicas de Sustentação

As rotas são governadas pelo `react-router-dom` v7 no arquivo fundamental `App.tsx`:

## Resumo Rotas Restritas (Administrativas)
Exigem que o Context encapsulado pelo Clerk identifique sessões válidas. Estão dentro do pacote `AdminLayout` e protegidas com `<RoleGuard>`.

* `/admin/dashboard` - Painel Master, estatísticas.
* `/admin/homenageados` - Entidade Principal para visualização e CRUD de indicações.
* `/admin/aprovacoes` - Fila pipeline e esteira de aprovação.
* `/admin/premios` | `/admin/marcas` | `/admin/unidades` | `/admin/home-media` - Configurações fundamentais abertas para Super Admins.
* `/admin/usuarios` - Espelho das sub-contas criadas no Clerk. Onde ocorre as remoções atômicas e elevação de privilégios.

## Resumo de Rotas Públicas
Abertas aos visitantes externos, encapsulados no pacote do `PublicLayout` com o header minimalista e barra de busca visual.

* `/` (Home)
* `/sobre`
* `/galeria` - Linha dotempo interativa por prêmio.
* `/homenageado/:id` - A renderização definitiva "Single Page" do profissional laureado que é compartilhada.

## Principais Dependências 
Para a equipe de dev atentar no ato de manutenção visual ou sistêmica futuramente:

* **Para PDFs**: Utiliza-se a dobradinha de `html2canvas` para "bater prints do DOM invisível" aliado ao `jspdf` ou `html2pdf.js` para renderizar isso encapsulado no tamanho A4 da folha de aprovação ou certificados.
* **Para Gráficos**: Recharts, a configuração de cor (Tailwind Colors e Dourados) e os raios e margens estão setados de modo interativo no `DashboardPage.tsx`.
* **Upload via Corte do Homenageado**: `react-easy-crop` garante o _aspect-ratio_ do perfil de todos os professores indicados (reduzindo poluição visual da grid home).

## Dicas Rápidas de Configuração Contínua:
* Ao dar fork ou clone nesse repositório, criar rapidamente um arquivo `.env` com todas as chaves de **Public Supabase Anon Key**, **API do Supabase (URL)** e **Publishable Key do Clerk**.
* O Clerk necessita de _Webhooks Secret_ salvos das variáveis do Edge Functions para permitir uma sincronicidade em via dupla real time com o Auth.
* Evitar apagar o UID Master Admin no Clerk manual (pelo seu Dashboard fora da IDE). Se você fizer isso poderá quebrar a amarração do Row Level Security se não recadastrar e promover ele novamente no `profiles` do Supabase como cargo `super_admin`. Sempre use comandos ou rotinas de `promote`.
