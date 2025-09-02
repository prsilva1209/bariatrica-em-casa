
-- Remove o índice único legado que impede múltiplas dificuldades por dia/ordem
DROP INDEX IF EXISTS public.uq_exercises_day_order;

-- Opcional (limpeza): remover check antigo 1..10, pois já há um check 1..5 ativo
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_exercise_order_check;
