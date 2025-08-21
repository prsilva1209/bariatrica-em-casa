
-- 1) Deduplicar registros antes de criar índices únicos

-- daily_progress: manter o registro mais recente por (user_id, day_number)
DELETE FROM public.daily_progress d1
USING public.daily_progress d2
WHERE d1.user_id = d2.user_id
  AND d1.day_number = d2.day_number
  AND d1.id <> d2.id
  AND d1.updated_at < d2.updated_at;

-- exercise_completions: manter a conclusão mais antiga por (user_id, exercise_id)
DELETE FROM public.exercise_completions e1
USING public.exercise_completions e2
WHERE e1.user_id = e2.user_id
  AND e1.exercise_id = e2.exercise_id
  AND e1.id <> e2.id
  AND e1.completed_at > e2.completed_at;

-- 2) Criar índices/constraints únicos para consistência

-- Um exercício por ordem/dia
CREATE UNIQUE INDEX IF NOT EXISTS uq_exercises_day_order
ON public.exercises (day_number, exercise_order);

-- Um progresso por dia/usuário
CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_progress_user_day
ON public.daily_progress (user_id, day_number);

-- Uma conclusão por exercício/usuário
CREATE UNIQUE INDEX IF NOT EXISTS uq_exercise_completions_user_exercise
ON public.exercise_completions (user_id, exercise_id);

-- 3) Semear exercícios para os dias 4 a 30 (5 exercícios por dia).
-- Seguro para rodar múltiplas vezes por causa do ON CONFLICT DO NOTHING.

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
  day AS day_number,
  ord AS exercise_order,
  'Exercício ' || ord || ' - Dia ' || day AS title,
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
FROM generate_series(4, 30) AS day
CROSS JOIN generate_series(1, 5) AS ord
ON CONFLICT (day_number, exercise_order) DO NOTHING;

-- 4) Reconciliar/atualizar o daily_progress com base no que já foi concluído
WITH counts AS (
  SELECT user_id, day_number, COUNT(*)::int AS c, MAX(completed_at) AS last_completed_at
  FROM public.exercise_completions
  GROUP BY user_id, day_number
)
INSERT INTO public.daily_progress (user_id, day_number, completed_exercises, is_day_completed, completion_date)
SELECT
  c.user_id,
  c.day_number,
  c.c,
  (c.c >= 5) AS is_day_completed,
  CASE WHEN c.c >= 5 THEN c.last_completed_at ELSE NULL END AS completion_date
FROM counts c
ON CONFLICT (user_id, day_number) DO UPDATE
SET
  completed_exercises = EXCLUDED.completed_exercises,
  is_day_completed     = EXCLUDED.is_day_completed,
  completion_date      = COALESCE(EXCLUDED.completion_date, public.daily_progress.completion_date),
  updated_at           = now();
