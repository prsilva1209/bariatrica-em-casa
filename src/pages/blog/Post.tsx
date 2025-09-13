import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Calendar, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';

interface BlogPost {
  title: string;
  content: string;
  author: string;
  created_at: string;
  images: Image[];
}

interface Image {
  alt: string;
  url: string;
  caption: string;
  position: string; // pode ser "top", "inline" etc
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, content, author, created_at,images')
          .eq('slug', slug);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setPost(data[0]);
        } else {
          setPost(null);
        }

      } catch (error: any) {
        toast({
          title: "Erro ao carregar o post",
          description: error.message,
          variant: "destructive",
        });
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground font-medium">Carregando post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">Post não encontrado</h1>
          <p className="text-base text-muted-foreground mb-8">O post que você está procurando não existe ou houve um erro.</p>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
          >
            Voltar para o blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          <main>
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 text-primary font-medium hover:underline mb-8"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Voltar para o blog</span>
            </Link>

            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 transition-shadow hover:shadow-2xl">
              <CardContent className="p-8">
                <h1 className="text-4xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-gray-100">
                  {post.title}
                </h1>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="w-5 h-5" />
                    <time dateTime={new Date(post.created_at).toISOString()} className="font-semibold">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Por {post.author}</span>
                  </div>
                </div>
                <article
                  className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>
          </main>

          <aside className="hidden md:block">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
