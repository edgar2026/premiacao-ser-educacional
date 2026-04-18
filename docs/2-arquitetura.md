# 2. Arquitetura do Sistema

## Padrão Frontend 
Foi adotada uma estruturação modular no React com `Vite`. Tudo parte do princípio de _Feature Sliced Design_ (Arquitetura orientada a Funcionalidades/Recursos).

```bash
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

## Arquitetura de Serviço (Serverless Backend)

1. **Clerk Auth**: Toma conta da porta de entrada e sessões.
2. **Supabase (PostgreSQL)**: Contém o modelo de domínio do negócio. Com as diretrizes de RLS (Row-Level Security), impede o acesso de dados com a permissão incorreta diretamente na camada do banco de dados, caso um payload customizado seja enviado indevidamente pela rede.
3. **Supabase Edge Functions (Deno)**: Atuam como os "Controllers" com poderes _bypass_ (ignoram RLS por usarem chave de serviço) entre o Banco de dados e a interface/autenticação:
   * **sync-clerk-users / sync-clerk-profile**: Rotinas chamadas de dentro do painel ou engatilhadas por um admin para garantir que a tabela `profiles` estampa (reflete) os usuários criados no Provider.
   * **set-clerk-role**: Promove ou expulsa níveis de _role_ de um usuário dentro da estrutura _public_metadata_ do Clerk, além da sua replicação no Supabase.

---
## Fluxo de Deploy Contínuo (CI/CD)
O projeto está configurado para deploy imediato e transparente na **Vercel**. Toda vez que há um commit no branch `main` no GitHub, o processo inicializa nativamente usando o comando mapeado no `package.json`: `pnpm run build` (que faz tanto a análise local typescript `tsc -b` e o Vite Build). Um arquivo `vercel.json` gerencia o redirecionamento seguro para lidar com o ciclo de vida do `React Router Dom` no servidor estático.
