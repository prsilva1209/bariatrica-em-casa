
-- 1) Inserir exercícios do Dia 3 (evita duplicar com ON CONFLICT)
INSERT INTO public.exercises (
  day_number,
  exercise_order,
  title,
  description,
  duration_minutes,
  youtube_video_id,
  instructions,
  difficulty_level,
  calories_estimate
)
SELECT
  3 AS day_number,
  ord AS exercise_order,
  'Exercício ' || ord || ' - Dia 3' AS title,
  'Exercício de baixo impacto, seguro para iniciantes e pessoas com obesidade. Foque em movimentos suaves e respiração.' AS description,
  10 AS duration_minutes,
  NULL AS youtube_video_id,
  CASE ord
    WHEN 1 THEN '1) Aquecimento articular sentado: 2-3 min. Movimente pescoço, ombros, punhos e tornozelos suavemente.'
    WHEN 2 THEN '2) Caminhada leve no lugar: 3-5 min. Mantenha postura e respiração. Ajuste intensidade ao seu conforto.'
    WHEN 3 THEN '3) Sentar e levantar assistido: 2-3 séries de 5-8 repetições. Use apoio das mãos se necessário, sem dor.'
    WHEN 4 THEN '4) Remada elástica/toalha: 2-3 séries de 8-10 repetições, controle o movimento e respire.'
    ELSE '5) Alongamentos e respiração: 3-5 min. Foque no relaxamento e sensação de bem-estar.'
  END AS instructions,
  1 AS difficulty_level,
  50 AS calories_estimate
FROM generate_series(1, 5) AS ord
ON CONFLICT (day_number, exercise_order) DO NOTHING;

-- 2) Adicionar coluna de imagem (URL público) aos exercícios
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS image_url text;

-- 3) Criar enum de papéis e tabela de user_roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) Função para verificar papel (evita RLS recursivo)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 5) Políticas RLS para user_roles
-- Usuários podem ver seus próprios papéis
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin pode ver todos os papéis
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin pode conceder/revogar papéis
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Ajustar políticas de exercises (manter SELECT para todos, permitir CRUD para admin)
-- Remover política antiga que negava ALL (se existir)
DROP POLICY IF EXISTS "Admins can manage exercises" ON public.exercises;

-- Permanece: todos podem ver (já existe conforme seu projeto). Recriar por segurança:
DROP POLICY IF EXISTS "Everyone can view exercises" ON public.exercises;
CREATE POLICY "Everyone can view exercises"
  ON public.exercises
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin pode inserir
CREATE POLICY IF NOT EXISTS "Admins can insert exercises"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin pode atualizar
CREATE POLICY IF NOT EXISTS "Admins can update exercises"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin pode deletar
CREATE POLICY IF NOT EXISTS "Admins can delete exercises"
  ON public.exercises
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7) Permitir que admins gerenciem perfis (profiles)
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8) Permitir que admins gerenciem progresso e conclusões (limpar/ajustar, se necessário)
CREATE POLICY IF NOT EXISTS "Admins can manage daily progress"
  ON public.daily_progress
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins can manage exercise completions"
  ON public.exercise_completions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
