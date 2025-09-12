
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const OGuiaDoIniciante = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Botão de Voltar */}
        <div className="mb-6">
          <Link to="/blog" className="text-sm text-muted-foreground flex items-center gap-1 hover:underline">
            <ChevronLeft className="w-4 h-4" />
            Voltar para o blog
          </Link>
        </div>

        {/* Conteúdo do Post */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">O Guia do Iniciante: Dando o Primeiro Passo no Emagrecimento</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span>12 de Setembro de 2025</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-primary" />
                <span>Por Equipe Bariátrica em Casa</span>
              </div>
            </div>

            <p className="mb-4 leading-relaxed">
              A decisão de começar a se exercitar é o primeiro e mais importante passo para uma vida mais saudável. Se a ideia de ir para uma academia te assusta ou se você não sabe por onde começar, este guia foi feito para você, que busca uma transformação real e duradoura.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Entendendo o Ponto de Partida</h2>
            <p className="mb-4 leading-relaxed">
              Muitas pessoas com sobrepeso ou obesidade sentem vergonha ou medo de se expor em ambientes de academia. Essa barreira emocional é real e precisa ser respeitada. O nosso programa foi pensado exatamente para superar isso, oferecendo um ambiente seguro no conforto da sua casa. Lembre-se, o corpo é seu templo, e a jornada de cuidado começa com um ato de amor-próprio, não de autojulgamento.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Exercícios de Baixo Impacto</h2>
            <p className="mb-4 leading-relaxed">
              Não é preciso correr uma maratona para começar. Comece com o que é seguro e divertido. Caminhadas leves, alongamentos, exercícios de força com o próprio peso corporal e yoga são ideais para iniciar. Eles fortalecem o corpo e a mente sem sobrecarregar as articulações. O importante é a consistência, não a intensidade.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">A Importância do Acompanhamento</h2>
            <p className="mb-4 leading-relaxed">
              Um dos grandes diferenciais do nosso programa é o acompanhamento diário. Nossos profissionais estão ao seu lado para guiar cada passo, ajustar os treinos e oferecer o suporte emocional necessário. Diferente de vídeos aleatórios no YouTube, o **Desafio Bariátrica em Casa** oferece um plano estruturado, pensado por especialistas para as suas necessidades específicas.
            </p>

            <div className="mt-8 text-center">
              <Link to="/" className="text-lg font-bold text-primary hover:underline">
                Conheça nosso programa e comece sua jornada agora!
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OGuiaDoIniciante;
