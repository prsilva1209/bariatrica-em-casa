-- Expandir goal_type para incluir "bariatric_indicated"
ALTER TYPE goal_type ADD VALUE 'bariatric_indicated';

-- Adicionar target_audience aos exercícios
ALTER TABLE exercises ADD COLUMN target_audience goal_type DEFAULT 'lose_weight';

-- Adicionar campos aos planos
ALTER TABLE workout_plans ADD COLUMN target_audience goal_type DEFAULT 'lose_weight';
ALTER TABLE workout_plans ADD COLUMN difficulty_level difficulty_level DEFAULT 'medio';