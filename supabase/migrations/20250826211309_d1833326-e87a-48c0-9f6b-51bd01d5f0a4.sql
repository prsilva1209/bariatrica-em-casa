-- Segunda parte: criar tabelas e policies
-- Criar sistema de planos de treino
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar referência de plano aos exercícios
ALTER TABLE public.exercises 
ADD COLUMN plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL;

-- Sistema de logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies para workout_plans
CREATE POLICY "Everyone can view workout plans" 
ON public.workout_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and instructors can manage workout plans" 
ON public.workout_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instrutor'::app_role));

-- RLS Policies para audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Atualizar policies de exercises para incluir instrutores
DROP POLICY IF EXISTS "Admins can manage exercises" ON public.exercises;
CREATE POLICY "Admins and instructors can manage exercises" 
ON public.exercises 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instrutor'::app_role));

-- Trigger para updated_at nas novas tabelas
CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON public.workout_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar logs de auditoria
CREATE OR REPLACE FUNCTION public.create_audit_log(
  _action TEXT,
  _table_name TEXT,
  _record_id UUID,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), _action, _table_name, _record_id, _old_values, _new_values
  );
END;
$$;