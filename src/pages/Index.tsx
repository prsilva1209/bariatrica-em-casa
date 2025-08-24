import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, Shield, Users, ChevronRight, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Bariatrica em Casa</h1>
              <p className="text-xs text-muted-foreground">Programa de 30 dias</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-primary">
              Começar Agora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Bariatrica em Casa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Um programa de 30 dias especialmente desenvolvido para pessoas que querem 
              perder peso com <span className="text-primary font-semibold">cuidado e delicadeza</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary text-lg px-8 py-4">
                Começar Minha Jornada
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Exercícios adaptados</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Acompanhamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Com muito cuidado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher nosso programa?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Desenvolvido especialmente para pessoas obesas e que consideram cirurgia bariátrica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Abordagem Delicada</h3>
                <p className="text-muted-foreground">
                  Exercícios desenvolvidos com cuidado especial para pessoas obesas, 
                  respeitando limitações e promovendo bem-estar.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Objetivos Personalizados</h3>
                <p className="text-muted-foreground">
                  Programa adaptado para perda de peso, manutenção ou preparação 
                  para cirurgia bariátrica, baseado no seu IMC.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Acompanhamento Diário</h3>
                <p className="text-muted-foreground">
                  5 exercícios por dia com instruções detalhadas, vídeos explicativos 
                  e sistema de progresso motivacional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como funciona?</h2>
            <p className="text-muted-foreground text-lg">
              Um processo simples e cuidadoso para sua jornada de bem-estar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Cadastro",
                description: "Crie sua conta com segurança"
              },
              {
                step: "2", 
                title: "Avaliação",
                description: "Calcule seu IMC e defina objetivos"
              },
              {
                step: "3",
                title: "Exercícios",
                description: "5 exercícios por dia, no seu ritmo"
              },
              {
                step: "4",
                title: "Progresso",
                description: "Acompanhe sua evolução diária"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Pronto para cuidar de você com carinho?
          </h2>
          <p className="text-muted-foreground text-lg">
            Comece hoje mesmo sua jornada de 30 dias rumo ao bem-estar. 
            Cada passo importa, e estamos aqui para apoiar você.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-lg px-8 py-4">
              Começar Agora - É Gratuito
              <Heart className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Bariatrica em Casa</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Cuidando da sua saúde com amor e dedicação. Seu bem-estar é nossa prioridade.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
