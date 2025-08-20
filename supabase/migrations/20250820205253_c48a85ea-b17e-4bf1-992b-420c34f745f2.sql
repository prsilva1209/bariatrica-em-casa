-- Sistema de Perda de Peso - 30 Dias
-- Estrutura completa para usuários, exercícios e progresso

-- Tipos de objetivo para o programa
CREATE TYPE public.goal_type AS ENUM ('maintain_weight', 'lose_weight', 'bariatric_prep');

-- Tabela de perfis dos usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  height DECIMAL(5,2) NOT NULL, -- em centímetros
  weight DECIMAL(5,2) NOT NULL, -- em kg
  current_bmi DECIMAL(4,2) NOT NULL,
  goal_type goal_type NOT NULL DEFAULT 'lose_weight',
  program_start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de exercícios
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  exercise_order INTEGER NOT NULL CHECK (exercise_order >= 1 AND exercise_order <= 5),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  youtube_video_id TEXT, -- ID do vídeo do YouTube
  instructions TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
  calories_estimate INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_number, exercise_order)
);

-- Tabela de progresso diário
CREATE TABLE public.daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  completed_exercises INTEGER DEFAULT 0 CHECK (completed_exercises >= 0 AND completed_exercises <= 5),
  is_day_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  weight_check DECIMAL(5,2), -- peso do dia se informado
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Tabela de exercícios completados individualmente
CREATE TABLE public.exercise_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id, day_number)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para exercises - todos podem visualizar
CREATE POLICY "Everyone can view exercises" 
ON public.exercises FOR SELECT 
TO authenticated
USING (true);

-- Apenas administradores podem gerenciar exercícios (implementar depois)
CREATE POLICY "Admins can manage exercises" 
ON public.exercises FOR ALL 
USING (false); -- Por enquanto bloqueado, implementar role de admin depois

-- Políticas para daily_progress
CREATE POLICY "Users can view their own progress" 
ON public.daily_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.daily_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.daily_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para exercise_completions
CREATE POLICY "Users can view their own completions" 
ON public.exercise_completions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
ON public.exercise_completions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at
  BEFORE UPDATE ON public.daily_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Este trigger será ativado mas o perfil será criado via interface
  -- para coletar dados necessários (altura, peso, etc.)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir exercícios exemplo para os primeiros dias
INSERT INTO public.exercises (day_number, exercise_order, title, description, duration_minutes, instructions, difficulty_level, calories_estimate) VALUES
-- Dia 1
(1, 1, 'Caminhada Leve', 'Caminhada em ritmo confortável para ativação do metabolismo', 15, 'Mantenha um ritmo confortável, respire naturalmente. Se sentir cansaço, diminua o ritmo mas continue caminhando.', 1, 75),
(1, 2, 'Alongamento de Pescoço', 'Alongamento suave para relaxar a região cervical', 5, 1. Incline a cabeça para a direita, segure por 15 segundos\n2. Repita para a esquerda\n3. Incline para frente e para trás\n4. Faça movimentos circulares suaves', 1, 15),
(1, 3, 'Respiração Profunda', 'Exercício de respiração para oxigenação e relaxamento', 8, '1. Inspire pelo nariz por 4 segundos\n2. Segure o ar por 4 segundos\n3. Expire pela boca por 6 segundos\n4. Repita 10 vezes', 1, 20),
(1, 4, 'Elevação de Braços Sentado', 'Exercício suave para ombros e braços', 10, '1. Sente-se com as costas retas\n2. Eleve os braços lateralmente até a altura dos ombros\n3. Abaixe lentamente\n4. Faça 3 séries de 10 repetições', 1, 30),
(1, 5, 'Marcha Estacionária', 'Simulação de caminhada no lugar', 12, '1. Levante alternadamente os joelhos\n2. Balance os braços naturalmente\n3. Mantenha ritmo confortável\n4. Pare se sentir muito cansaço', 1, 40),

-- Dia 2
(2, 1, 'Caminhada com Variação', 'Caminhada intercalando ritmos', 18, 'Caminhe 2 minutos normal, 1 minuto mais rápido, 2 minutos normal. Repita o ciclo.', 1, 90),
(2, 2, 'Alongamento de Ombros', 'Relaxamento para região dos ombros', 6, '1. Abraçar o próprio corpo\n2. Alongar um braço sobre o peito\n3. Circular os ombros para trás\n4. Respirar profundamente', 1, 18),
(2, 3, 'Flexão de Braços na Parede', 'Fortalecimento suave do peito e braços', 8, '1. Fique de pé a 60cm da parede\n2. Apoie as palmas na parede\n3. Flexione os braços aproximando o peito da parede\n4. Retorne à posição inicial', 1, 35),
(2, 4, 'Elevação de Pernas Sentado', 'Fortalecimento das pernas', 10, '1. Sente-se com as costas retas\n2. Eleve alternadamente as pernas\n3. Mantenha por 2 segundos no alto\n4. Faça 10 repetições cada perna', 1, 40),
(2, 5, 'Relaxamento Corporal', 'Exercício para relaxar todo o corpo', 8, '1. Deite-se confortavelmente\n2. Contraia e relaxe cada grupo muscular\n3. Comece pelos pés e suba até a cabeça\n4. Respire profundamente', 1, 25);