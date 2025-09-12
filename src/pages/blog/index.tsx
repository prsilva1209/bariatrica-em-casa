import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Eye, Home, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  views?: number | null; // caso não tenha esse campo, pode usar 0
}

const BlogPage = () => {
  const location = useLocation();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca posts ordenados pela data criada, do mais recente ao mais antigo
        const { data, error } = await supabase
          .from<BlogPost>('blog_posts')
          .select('id, title, slug, excerpt, created_at, views')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setBlogPosts(data);
        }
      } catch (err) {
        // Melhore o tratamento de erro conforme precise
        setError('Erro ao carregar os posts. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Formata data para exibir tipo "12 de Setembro de 2025"
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

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
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        {/* Header do Blog */}
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold mb-3 text-gray-900 dark:text-gray-100">
            Blog Bariátrica em Casa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artigos, dicas e histórias para te inspirar na sua jornada de saúde.
          </p>
        </header>

        {/* Loading/Error */}
        {loading && (
          <p className="text-center text-primary font-semibold">Carregando posts...</p>
        )}
        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        {/* Lista de Posts */}
        {!loading && !error && (
          <div className="space-y-8">
            {blogPosts.length === 0 && (
              <p className="text-center text-muted-foreground">
                Nenhum post encontrado.
              </p>
            )}

            {blogPosts.map((post) => (
              <Card
                key={post.id}
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
                      <time>{formatDate(post.created_at)}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>{post.views ?? 0} visualizações</span>
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
        )}
      </main>
    </div>
  );
};

export default BlogPage;
