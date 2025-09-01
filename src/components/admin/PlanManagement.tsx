import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  difficulty_level: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const PlanManagement = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_audience: 'lose_weight' as const,
    difficulty_level: 'medio' as const,
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Erro ao carregar planos",
        description: "Não foi possível carregar os planos de treino.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, digite um título para o plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editing) {
        // Atualizar plano existente
        const { error } = await supabase
          .from('workout_plans')
          .update({
            title: formData.title,
            description: formData.description,
            target_audience: formData.target_audience,
            difficulty_level: formData.difficulty_level,
          })
          .eq('id', editing);

        if (error) throw error;

        // Log de auditoria
        await supabase.rpc('create_audit_log', {
          _action: 'UPDATE',
          _table_name: 'workout_plans',
          _record_id: editing,
          _new_values: formData,
        });

        toast({
          title: "Plano atualizado",
          description: "Plano de treino atualizado com sucesso!",
        });
      } else {
        // Criar novo plano
        const { data, error } = await supabase
          .from('workout_plans')
          .insert({
            title: formData.title,
            description: formData.description,
            target_audience: formData.target_audience,
            difficulty_level: formData.difficulty_level,
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Log de auditoria
        await supabase.rpc('create_audit_log', {
          _action: 'CREATE',
          _table_name: 'workout_plans',
          _record_id: data.id,
          _new_values: formData,
        });

        toast({
          title: "Plano criado",
          description: "Novo plano de treino criado com sucesso!",
        });
      }

      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o plano.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: WorkoutPlan) => {
    setFormData({
      title: plan.title,
      description: plan.description || '',
      target_audience: plan.target_audience as any,
      difficulty_level: plan.difficulty_level as any,
    });
    setEditing(plan.id);
    setShowAddForm(true);
  };

  const handleDelete = async (planId: string, planTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${planTitle}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      // Log de auditoria
      await supabase.rpc('create_audit_log', {
        _action: 'DELETE',
        _table_name: 'workout_plans',
        _record_id: planId,
        _old_values: { title: planTitle },
      });

      toast({
        title: "Plano excluído",
        description: "Plano de treino excluído com sucesso!",
      });
      
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o plano.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_audience: 'lose_weight' as const,
      difficulty_level: 'medio' as const,
    });
    setEditing(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 bg-gradient-primary rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <p className="text-muted-foreground">
            Total de planos: {plans.length}
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? 'Editar Plano' : 'Novo Plano'}
            </CardTitle>
            <CardDescription>
              {editing ? 'Atualize as informações do plano' : 'Crie um novo plano de treino'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Plano de Emagrecimento Iniciante"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os objetivos e características do plano..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="target-audience">Público-alvo *</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value) => setFormData({ ...formData, target_audience: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o público-alvo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Pré-bariátrica (perder peso)</SelectItem>
                  <SelectItem value="bariatric_indicated">Bariátrica indicada (IMC alto)</SelectItem>
                  <SelectItem value="maintain_weight">Sobrepeso leve (manutenção)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty-level">Dificuldade *</Label>
              <Select 
                value={formData.difficulty_level} 
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum plano de treino encontrado.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{plan.title}</h3>
                    {plan.description && (
                      <p className="text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    )}
                    <div className="flex gap-2 text-xs mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {plan.target_audience === 'lose_weight' ? 'Pré-bariátrica' : 
                         plan.target_audience === 'bariatric_indicated' ? 'Bariátrica indicada' : 
                         'Sobrepeso leve'}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {plan.difficulty_level === 'facil' ? 'Fácil' : 
                         plan.difficulty_level === 'medio' ? 'Médio' : 'Difícil'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.id, plan.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanManagement;