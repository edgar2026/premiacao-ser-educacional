-- Script Gerado Automaticamente para Sincronizar Clerk com Supabase
-- Rode isso no SQL Editor do Supabase

-- 1. Corrigir a tabela profiles para aceitar IDs do Clerk e ter a coluna "ativo"
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- 2. Sincronizando usuários...
INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) 
VALUES ('user_3C62aWPphmP3w2yoH7MuU3vqNuH', 'edgartavares2026@gmail.com', 'EDGAR TAVARES55', 'diretor', '5ce29989-a327-4c5e-a560-bb0ecd66317a', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit_id = EXCLUDED.unit_id;

INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) 
VALUES ('user_3C3HJg4YMjuYI7rszxRpuiRNkiK', 'eedgareda2015@gmail.com', 'EDGAR TAVARES55', 'diretor', '7b7246b3-31b9-4cd6-bfec-1ab0e43a36d7', true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit_id = EXCLUDED.unit_id;

INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) 
VALUES ('user_38nO0dR4Y0H2qtabHcvkz8FFypz', 'direcao.olinda@uninassau.edu.br', 'DIREÇÃO OLINDA', 'super_admin', NULL, true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit_id = EXCLUDED.unit_id;

INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) 
VALUES ('user_38jBWEoJWrU5xryFwdDigtv8d8U', 'edgareda2015@gmail.com', 'EDGAR TAVARES', 'super_admin', NULL, true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit_id = EXCLUDED.unit_id;

INSERT INTO public.profiles (id, username, full_name, role, unit_id, ativo) 
VALUES ('user_38j0sWcg2Zw5ii04MtnyyAxkS6k', 'edgar.tavares@mauriciodenassau.edu.br', 'EDGAR TAVARES', 'super_admin', NULL, true)
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  unit_id = EXCLUDED.unit_id;

