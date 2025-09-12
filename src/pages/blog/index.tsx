import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Eye, Home, FileText } from 'lucide-react';

// Botão estilizado para Lovable - você pode importar se existir
const Button = ({
  children,
  to,
  className = '',
}: {
  children: React.ReactNode;
  to: string;
  className?: string;
}) => (
  <Link
    to={to}
    className={`inline-block px-5 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors font-semibold shadow-md ${className}`}
  >
    {children}
  </Link>
);

const BlogPage = () => {
  const location = useLocation();

  const blogPosts = [
    {
      title: 'O Guia do Iniciante: Dando o Primeiro Passo no Emagrecimento',
      slug: 'o-guia-do-iniciante',
      excerpt:
        'Se você tem vergonha da academia e quer começar a se exercitar em casa, este é o guia perfeito para você. Saiba como iniciar sua jornada com segurança e confiança, focando em exercícios de baixo impacto e na sua saúde mental.',
      date: '12 de Setembro de 2025',
      views: '1.200',
    },
    {
      title: 'Exercícios para Quem Tem Diabetes e Precisa Emagrecer',
      slug: 'exercicios-para-quem-tem-diabetes',
      excerpt:
        'A atividade física é uma poderosa aliada no controle do diabetes. Descubra como a nossa abordagem focada em saúde pode te ajudar a gerenciar a glicemia e a melhorar sua qualidade de vida, mesmo com as comorbidades.',
      date: '05 de Setembro de 2025',
      views: '850',
    },
    {
      title: 'Desafio Bariátrica em Casa: O Caminho para quem não é candidato à cirurgia',
      slug: 'o-caminho-sem-cirurgia',
      excerpt:
        'A cirurgia bariátrica não é a única solução. Nosso programa oferece um caminho seguro e eficaz para alcançar a perda de peso e o bem-estar, com o apoio de profissionais, tudo no conforto do seu lar.',
      date: '28 de Agosto de 2025',
      views: '2.500',
    },
  ];

  // Menu simples com destaque para página atual
  const menuItems = [
    {
      label: 'Home',
      to: '/',
      icon: <Home className="w-5 h-5 mr-2" />,
    },
    {
      label: 'Blog',
      to: '/blog',
      icon: <FileText className="w-5 h-5 mr-2" />,
    },
    // Pode adicionar mais itens aqui
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Menu Fixo Superior */}
      <nav className="fixed top-0 left-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-primary select-none">
            Bariátrica em Casa
          </h1>

          <ul className="flex gap-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center text-md font-semibold transition-colors ${
                      isActive
                        ? 'text-primary underline underline-offset-4'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        {/* Header do Blog */}
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold mb-3 text-gray-900 dark:text-gray-100">
            Blog Bariátrica em Casa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artigos, dicas e histórias para te inspirar na sua jornada de saúde.
          </p>
        </header>

        {/* Lista de Posts */}
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Card
              key={post.slug}
              className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 transition-shadow hover:shadow-2xl"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-extrabold leading-tight">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:underline text-gray-900 dark:text-gray-100"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-5 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="w-4 h-4" />
                    <time>{post.date}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{post.views} visualizações</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 flex justify-end">
                  <Button to={`/blog/${post.slug}`}>Ler mais &rarr;</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
