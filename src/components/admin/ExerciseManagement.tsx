
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  instructions: string;
  difficulty_level: number;
  calories_estimate: number;
  youtube_video_id?: string;
  image_url?: string;
  day_number: number;
  exercise_order: number;
}

const ExerciseManagement = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 10,
    instructions: '',
    difficulty_level: 1,
    calories_estimate: 50,
    youtube_video_id: '',
    image_url: '',
  });

  useEffect(() => {
    loadExercises();
  }, [selectedDay]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('day_number', selectedDay)
        .order('exercise_order');

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar exercícios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration_minutes: 10,
      instructions: '',
      difficulty_level: 1,
      calories_estimate: 50,
      youtube_video_id: '',
      image_url: '',
    });
  };

  const handleSave = async (exercise?: Exercise) => {
    try {
      const isEditing = !!exercise;
      const nextOrder = exercises.length > 0 ? Math.max(...exercises.map(e => e.exercise_order)) + 1 : 1;
      
      const exerciseData = {
        ...formData,
        day_number: selectedDay,
        exercise_order: isEditing ? exercise.exercise_order : nextOrder,
        youtube_video_id: formData.youtube_video_id || null,
        image_url: formData.image_url || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', exercise.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert(exerciseData);

        if (error) throw error;
      }

      toast({
        title: isEditing ? "Exercício atualizado!" : "Exercício criado!",
        description: `${formData.title} foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });

      resetForm();
      setEditingId(null);
      setShowAddForm(false);
      loadExercises();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar exercício",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      title: exercise.title,
      description: exercise.description,
      duration_minutes: exercise.duration_minutes,
      instructions: exercise.instructions,
      difficulty_level: exercise.difficulty_level,
      calories_estimate: exercise.calories_estimate,
      youtube_video_id: exercise.youtube_video_id || '',
      image_url: exercise.image_url || '',
    });
    setEditingId(exercise.id);
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;

      toast({
        title: "Exercício excluído!",
        description: "O exercício foi removido com sucesso.",
      });

      loadExercises();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir exercício",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Suave';
      case 2: return 'Moderado';
      case 3: return 'Intenso';
      default: return 'Suave';
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Exercícios por Dia</CardTitle>
          <CardDescription>
            Selecione o dia para visualizar e editar os exercícios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="day-select">Dia:</Label>
            <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Dia {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddForm(true)} className="ml-auto">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Exercício
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Exercise Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Novo Exercício - Dia {selectedDay}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); resetForm(); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form content will be the same as editing form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome do exercício"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duração (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty_level.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Suave</SelectItem>
                    <SelectItem value="2">Moderado</SelectItem>
                    <SelectItem value="3">Intenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="calories">Calorias estimadas</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories_estimate}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories_estimate: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="youtube">ID do vídeo YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube_video_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_id: e.target.value }))}
                  placeholder="Ex: dQw4w9WgXcQ"
                />
                {formData.youtube_video_id && (
                  <div className="mt-2">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${formData.youtube_video_id}`}
                        title="Preview"
                        frameBorder="0"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="image">URL da imagem</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição breve do exercício"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instruções</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Como executar o exercício (passo a passo)"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSave()}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercícios do Dia {selectedDay}</CardTitle>
          <CardDescription>
            {exercises.length} exercício(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando exercícios...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum exercício cadastrado para este dia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="border">
                  <CardContent className="p-4">
                    {editingId === exercise.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-title">Título</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-duration">Duração (min)</Label>
                            <Input
                              id="edit-duration"
                              type="number"
                              value={formData.duration_minutes}
                              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-difficulty">Dificuldade</Label>
                            <Select value={formData.difficulty_level.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Suave</SelectItem>
                                <SelectItem value="2">Moderado</SelectItem>
                                <SelectItem value="3">Intenso</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-calories">Calorias</Label>
                            <Input
                              id="edit-calories"
                              type="number"
                              value={formData.calories_estimate}
                              onChange={(e) => setFormData(prev => ({ ...prev, calories_estimate: parseInt(e.target.value) || 0 }))}
                            />
                          </div>
                           <div>
                             <Label htmlFor="edit-youtube">YouTube ID</Label>
                             <Input
                               id="edit-youtube"
                               value={formData.youtube_video_id}
                               onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_id: e.target.value }))}
                             />
                             {formData.youtube_video_id && (
                               <div className="mt-2">
                                 <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                                   <iframe
                                     width="100%"
                                     height="100%"
                                     src={`https://www.youtube.com/embed/${formData.youtube_video_id}`}
                                     title="Preview"
                                     frameBorder="0"
                                     className="w-full h-full"
                                   />
                                 </div>
                               </div>
                             )}
                           </div>
                           <div>
                             <Label htmlFor="edit-image">URL da imagem</Label>
                             <Input
                               id="edit-image"
                               value={formData.image_url}
                               onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                             />
                             {formData.image_url && (
                               <div className="mt-2">
                                 <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                                   <img
                                     src={formData.image_url}
                                     alt="Preview"
                                     className="w-full h-full object-cover"
                                   />
                                 </div>
                               </div>
                             )}
                           </div>
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Descrição</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-instructions">Instruções</Label>
                          <Textarea
                            id="edit-instructions"
                            value={formData.instructions}
                            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleSave(exercise)}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => { setEditingId(null); resetForm(); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{exercise.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>{exercise.duration_minutes} min</span>
                              <span>~{exercise.calories_estimate} cal</span>
                              <Badge variant="secondary">
                                {getDifficultyLabel(exercise.difficulty_level)}
                              </Badge>
                              <span className="text-muted-foreground">
                                Ordem: {exercise.exercise_order}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(exercise)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(exercise.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {(exercise.youtube_video_id || exercise.image_url) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium">Mídia anexada:</p>
                            {exercise.youtube_video_id && (
                              <p className="text-xs text-muted-foreground">
                                📹 YouTube: {exercise.youtube_video_id}
                              </p>
                            )}
                            {exercise.image_url && (
                              <p className="text-xs text-muted-foreground">
                                🖼️ Imagem: {exercise.image_url}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium mb-1">Instruções:</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">{exercise.instructions}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseManagement;
