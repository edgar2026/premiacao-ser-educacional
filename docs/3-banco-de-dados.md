# 3. Modelagem de Banco de Dados (Supabase - PostgreSQL)

A integridade do negócio reflete hierarquias geográficas rígidas para viabilizar o controle administrativo granular e RLS.

## Entidades Principais

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

## Storage e Uploads (Buckets do Supabase)
As imagens de Perfil do homenageado, documentos probatórios ou logotipos de capa da `Home`, são geridas por buckets vinculados ao **Supabase Storage**. Todas respeitam o versionamento de chaves via timestamp para burlar "cache agressivo" em substituições de arquivo no front-end.
