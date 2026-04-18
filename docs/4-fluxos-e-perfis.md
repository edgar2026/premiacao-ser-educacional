# 4. Fluxos, Permissões e Perfis (Roles)

## RLS (Row Level Security) e Acessos
O Banco restringe automaticamente as ações a depender do Perfil logado. Segue-se a árvore de governança corporativa:

### Níveis de Usuário (Gestão B2B Clerk/Supabase)
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

## Ciclo de Vida da Aprovação de um Homenageado
Todo cadastrado entra no sistema preenchendo um longo formulário "Stepper Interativo".

1. **Estado Rascunho / Pendente**: Assim que concluído por um diretor local, o Homenageado ganha um selo (`em_analise` ou `draft`).
2. **Dashboard de Resolução**: O Admin avalia as informações. Tivemos fluxos criados dentro da aba "Aprovação" no painel ADM, onde são lidos os documentos anexados.
3. **Aprovação**: Se verificado o aval, o Admin clica para Aprovar. O homenageado ganha tag de status para `aprovado`. Se possuir a condição extra booleana preenchida indicando sua pronta divulgação (`is_published: true`) o profissional passará a figurar visualmente na galeria principal pública de forma instantânea para os motores de busca. Representando sucesso da pipeline.
