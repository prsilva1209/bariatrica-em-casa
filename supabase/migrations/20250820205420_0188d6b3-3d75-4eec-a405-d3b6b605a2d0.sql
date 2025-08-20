-- Corrigir avisos de segurança das funções

-- Recriar função para atualizar timestamps com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar função para novos usuários com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Este trigger será ativado mas o perfil será criado via interface
  -- para coletar dados necessários (altura, peso, etc.)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;