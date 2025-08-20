import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Heart, Calculator, Target, AlertCircle } from 'lucide-react';

type GoalType = 'maintain_weight' | 'lose_weight' | 'bariatric_prep';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: 'lose_weight' as GoalType,
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-warning' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-success' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-warning' };
    if (bmi < 35) return { category: 'Obesidade grau I', color: 'text-destructive' };
    if (bmi < 40) return { category: 'Obesidade grau II', color: 'text-destructive' };
    return { category: 'Obesidade grau III', color: 'text-destructive' };
  };

  const isEligibleForBariatric = (bmi: number) => {
    return bmi >= 40 || bmi >= 35; // Critérios brasileiros simplificados
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const bmi = calculateBMI(weight, height);
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          height: height,
          weight: weight,
          current_bmi: parseFloat(bmi.toFixed(1)),
          goal_type: formData.goal,
        });

      if (error) throw error;

      toast({
        title: "Perfil criado com sucesso!",
        description: "Bem-vindo ao seu programa personalizado de bem-estar.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao criar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentBMI = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : 0;

  const bmiInfo = currentBMI > 0 ? getBMICategory(currentBMI) : null;
  const canDoBariatric = currentBMI > 0 ? isEligibleForBariatric(currentBMI) : false;

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Vamos conhecer você</h1>
          <p className="text-muted-foreground">Com carinho e sem pressa, conte-nos sobre seus objetivos</p>
        </div>

        <Progress value={(step / 3) * 100} className="mb-8" />

        <Card className="shadow-medium border-0">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Queremos cuidar de você da melhor forma possível
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Como podemos te chamar?</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Qual sua idade?</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    min="18"
                    max="100"
                  />
                </div>
                <Button 
                  onClick={handleNext} 
                  className="w-full bg-gradient-primary"
                  disabled={!formData.name || !formData.age}
                >
                  Continuar
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Vamos calcular seu IMC
                </CardTitle>
                <CardDescription>
                  Essas informações nos ajudam a personalizar seu programa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Sua altura (em centímetros)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    required
                    min="100"
                    max="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Seu peso atual (em kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 85.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                    min="30"
                    max="300"
                  />
                </div>

                {currentBMI > 0 && bmiInfo && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span className="font-medium">Seu IMC: {currentBMI.toFixed(1)}</span>
                    </div>
                    <p className={`text-sm ${bmiInfo.color}`}>
                      {bmiInfo.category}
                    </p>
                    
                    {canDoBariatric && (
                      <div className="mt-3 p-3 bg-accent/50 rounded border-l-4 border-accent">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-accent-foreground mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-accent-foreground">Critério para Cirurgia Bariátrica</p>
                            <p className="text-accent-foreground/80">
                              Baseado nos critérios brasileiros, você pode ser elegível para cirurgia bariátrica. 
                              Consulte sempre um médico especialista.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 bg-gradient-primary"
                    disabled={!formData.height || !formData.weight}
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Qual seu objetivo?
                </CardTitle>
                <CardDescription>
                  Vamos personalizar seu programa de acordo com sua meta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={formData.goal} 
                  onValueChange={(value: GoalType) => setFormData({ ...formData, goal: value })}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="lose_weight" id="lose_weight" />
                    <Label htmlFor="lose_weight" className="flex-1 cursor-pointer">
                      <div className="font-medium">Perder peso gradualmente</div>
                      <div className="text-sm text-muted-foreground">
                        Programa focado em emagrecimento saudável e sustentável
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                    <Label htmlFor="maintain_weight" className="flex-1 cursor-pointer">
                      <div className="font-medium">Manter peso e melhorar saúde</div>
                      <div className="text-sm text-muted-foreground">
                        Foco em exercícios e hábitos saudáveis para bem-estar geral
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bariatric_prep" id="bariatric_prep" />
                    <Label htmlFor="bariatric_prep" className="flex-1 cursor-pointer">
                      <div className="font-medium">Preparação para cirurgia bariátrica</div>
                      <div className="text-sm text-muted-foreground">
                        Programa específico para preparar o corpo antes da cirurgia
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 bg-gradient-primary"
                    disabled={loading}
                  >
                    {loading ? 'Criando seu programa...' : 'Começar jornada'}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;