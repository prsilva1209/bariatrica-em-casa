
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Eye } from 'lucide-react';

const BlogPage = () => {
  // Lista de posts do blog. Você pode adicionar novos posts aqui.
  // Em uma versão mais avançada, esta lista viria de um banco de dados.
  const blogPosts = [
    {
      title: 'O Guia do Iniciante: Dando o Primeiro Passo no Emagrecimento',
      slug: 'o-guia-do-iniciante',
      excerpt: 'Se você tem vergonha da academia e quer começar a se exercitar em casa, este é o guia perfeito para você. Saiba como iniciar sua jornada com segurança e confiança, focando em exercícios de baixo impacto e na sua saúde mental.',
      date: '12 de Setembro de 2025',
      views: '1.200'
    },
    {
      title: 'Exercícios para Quem Tem Diabetes e Precisa Emagrecer',
      slug: 'exercicios-para-quem-tem-diabetes',
      excerpt: 'A atividade física é uma poderosa aliada no controle do diabetes. Descubra como a nossa abordagem focada em saúde pode te ajudar a gerenciar a glicemia e a melhorar sua qualidade de vida, mesmo com as comorbidades.',
      date: '05 de Setembro de 2025',
      views: '850'
    },
    {
      title: 'Desafio Bariátrica em Casa: O Caminho para quem não é candidato à cirurgia',
      slug: 'o-caminho-sem-cirurgia',
      excerpt: 'A cirurgia bariátrica não é a única solução. Nosso programa oferece um caminho seguro e eficaz para alcançar a perda de peso e o bem-estar, com o apoio de profissionais, tudo no conforto do seu lar.',
      date: '28 de Agosto de 2025',
      views: '2.500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header do Blog */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Blog Bariátrica em Casa</h1>
        <p className="text-lg text-muted-foreground text-center mb-8">
          Artigos, dicas e histórias para te inspirar na sua jornada de saúde.
        </p>
      </div>

      {/* Lista de Posts */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="shadow-soft hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span>{post.views} visualizações</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4">
                <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-primary hover:underline">
                  Ler mais &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
